<template>
  <!-- 同意借阅申请弹窗，通过ref调用open方法 -->
  <el-dialog title="同意借阅申请" :visible.sync="visible" width="520px" append-to-body @closed="reset">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="书籍名称">
        <el-input :value="form.bookName" disabled />
      </el-form-item>
      <el-form-item label="书架号">
        <el-input :value="form.shelfCode" disabled />
      </el-form-item>
      <el-form-item label="囚号" prop="prisonerNumber">
        <el-input v-model="form.prisonerNumber" placeholder="请输入囚号" maxlength="255" />
      </el-form-item>
      <el-form-item label="借阅天数" prop="borrowDays">
        <el-input-number v-model="form.borrowDays" controls-position="right" :min="1" :max="365" />
        <span style="margin-left: 8px; color: #909399; font-size: 12px">默认7天</span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submitForm">确 认</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { approveBorrowRequest } from "@/api/ssk/borrowRequest"

export default {
  name: "BorrowRequestApproveDialog",
  data() {
    return {
      // 是否显示弹窗
      visible: false,
      // 提交中状态
      submitting: false,
      // 申请ID
      requestId: null,
      // 表单参数
      form: {},
      // 表单校验规则
      rules: {
        prisonerNumber: [{ required: true, message: "囚号不能为空", trigger: "blur" }],
        borrowDays: [{ required: true, message: "借阅天数不能为空", trigger: "blur" }]
      }
    }
  },
  methods: {
    /**
     * 打开弹窗
     * row: 当前申请行数据
     */
    open(row) {
      this.reset()
      this.requestId = row.id
      this.form.bookName = row.bookName
      this.form.shelfCode = row.shelfCode
      this.visible = true
    },
    /** 表单重置 */
    reset() {
      this.requestId = null
      this.form = {
        bookName: undefined,
        shelfCode: undefined,
        prisonerNumber: undefined,
        borrowDays: 7
      }
      this.submitting = false
      this.resetForm("form")
    },
    /** 提交表单 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return
        }
        this.submitting = true
        approveBorrowRequest(this.requestId, this.form.prisonerNumber, this.form.borrowDays)
          .then(() => {
            this.$modal.msgSuccess("同意成功，已生成借阅记录")
            this.visible = false
            this.$emit("success")
          })
          .finally(() => {
            this.submitting = false
          })
      })
    }
  }
}
</script>
