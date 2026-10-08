<template>
  <!-- 图书类目新增/编辑弹窗 -->
  <el-dialog :title="dialogTitle" :visible.sync="visible" width="560px" append-to-body @closed="reset">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="上级类目" prop="parentId">
        <treeselect
          v-model="form.parentId"
          :options="categoryOptions"
          :normalizer="normalizer"
          :show-count="true"
          placeholder="请选择上级类目，默认为顶级类目"
          no-results-text="未找到匹配的类目"
        />
      </el-form-item>
      <el-form-item label="类目标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入类目标题" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listBookCategory, addBookCategory, updateBookCategory } from "@/api/ssk/bookCategory"
import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

export default {
  name: "BookCategoryDialog",
  components: { Treeselect },
  data() {
    return {
      // 是否显示弹窗
      visible: false,
      // 弹窗标题
      dialogTitle: "",
      // 提交中状态，防止重复提交
      submitting: false,
      // 上级类目树选项
      categoryOptions: [],
      // 表单参数
      form: {},
      // 表单校验规则
      rules: {
        title: [
          { required: true, message: "类目标题不能为空", trigger: "blur" }
        ]
      }
    }
  },
  methods: {
    /**
     * 打开弹窗（供父组件通过ref调用）
     * mode: add-新增 edit-编辑
     * row: 新增时为父类目行（可为空表示新增顶级类目），编辑时为当前类目行
     */
    open(mode, row) {
      this.reset()
      this.dialogTitle = mode === "add" ? "新增类目" : "编辑类目"
      // 加载类目树作为上级选项
      this.loadCategoryOptions(mode, row).then(() => {
        if (mode === "add" && row) {
          // 新增子类目时默认选中当前节点
          this.form.parentId = row.id
        }
        if (mode === "edit") {
          this.form = {
            id: row.id,
            parentId: row.parentId,
            title: row.title,
            remark: row.remark
          }
        }
        this.visible = true
      })
    },
    /** 加载上级类目树选项，编辑时排除自身及子孙节点防止循环 */
    loadCategoryOptions(mode, row) {
      return listBookCategory().then(response => {
        let tree = response.data || []
        if (mode === "edit" && row) {
          tree = this.excludeNodeAndChildren(tree, row.id)
        }
        // 增加顶级类目根节点，便于选择顶级
        this.categoryOptions = [{ id: 0, title: "顶级类目", children: tree }]
      })
    },
    /** 递归排除指定节点及其子孙节点 */
    excludeNodeAndChildren(list, excludeId) {
      return list
        .filter(item => item.id !== excludeId)
        .map(item => ({
          ...item,
          children: item.children ? this.excludeNodeAndChildren(item.children, excludeId) : []
        }))
    },
    /** 转换树数据结构为treeselect所需格式 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.title,
        children: node.children
      }
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        parentId: 0,
        title: undefined,
        remark: undefined
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

        const request = this.form.id ? updateBookCategory(this.form) : addBookCategory(this.form)
        request.then(() => {
          this.$modal.msgSuccess(this.form.id ? "修改成功" : "新增成功")
          this.visible = false
          this.$emit("success")
        }).finally(() => {
          this.submitting = false
        })
      })
    }
  }
}
</script>
