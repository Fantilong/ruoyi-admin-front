<template>
  <!-- 图书新增/编辑弹窗，通过ref调用open方法 -->
  <el-dialog :title="dialogTitle" :visible.sync="visible" width="780px" append-to-body @closed="reset">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="书籍名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入书籍名称" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作者" prop="author">
            <el-input v-model="form.author" placeholder="请输入作者" maxlength="255" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="类目" prop="categoryIds">
            <category-tree-select v-model="form.categoryIds" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="书架号" prop="shelfCode">
            <shelf-code-select v-model="form.shelfCode" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="库存" prop="stockQuantity">
            <el-input-number v-model="form.stockQuantity" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="书籍描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入书籍描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="图片集">
            <book-image-upload v-model="form.images" :limit="5" :fileSize="5" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBook, addBook, updateBook } from "@/api/ssk/book"
import CategoryTreeSelect from "@/components/ssk/CategoryTreeSelect"
import ShelfCodeSelect from "@/components/ssk/ShelfCodeSelect"
import BookImageUpload from "@/components/ssk/BookImageUpload"

export default {
  name: "BookDialog",
  components: { CategoryTreeSelect, ShelfCodeSelect, BookImageUpload },
  data() {
    return {
      // 是否显示弹窗
      visible: false,
      // 弹窗标题
      dialogTitle: "",
      // 提交中状态
      submitting: false,
      // 表单参数
      form: {},
      // 表单校验规则
      rules: {
        name: [{ required: true, message: "书籍名称不能为空", trigger: "blur" }],
        description: [{ required: true, message: "书籍描述不能为空", trigger: "blur" }],
        stockQuantity: [{ required: true, message: "库存不能为空", trigger: "blur" }],
        author: [{ required: true, message: "作者不能为空", trigger: "blur" }],
        categoryIds: [{ required: true, message: "类目不能为空", trigger: "change" }],
        shelfCode: [{ required: true, message: "书架号不能为空", trigger: "change" }]
      }
    }
  },
  methods: {
    /**
     * 打开弹窗（供父组件通过ref调用）
     * mode: add-新增 edit-编辑
     * row: 编辑时的当前行数据
     * selectedCategoryIds: 从左侧树带入的类目ID，用于新增时自动选中
     */
    open(mode, row, selectedCategoryIds) {
      this.reset()
      this.dialogTitle = mode === "add" ? "新增图书" : "编辑图书"
      if (mode === "add") {
        // 新增时，如果左侧选中了类目节点则自动带入
        if (selectedCategoryIds) {
          this.form.categoryIds = selectedCategoryIds
        }
        this.visible = true
      } else if (mode === "edit") {
        // 编辑时，加载详情
        getBook(row.id).then(response => {
          this.form = response.data
          this.visible = true
        })
      }
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        description: undefined,
        stockQuantity: 1,
        author: undefined,
        categoryIds: "",
        shelfCode: undefined,
        cover: undefined,
        images: undefined
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
        const request = this.form.id ? updateBook(this.form) : addBook(this.form)
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
