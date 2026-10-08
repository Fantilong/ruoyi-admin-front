<template>
  <div class="app-container">
    <!-- 顶部操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd()"
          v-hasPermi="['ssk:bookCategory:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multipleSelection.length === 0"
          @click="handleBatchDelete"
          v-hasPermi="['ssk:bookCategory:remove']"
        >批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :search="false" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 类目树表格 -->
    <el-table
      v-if="refreshTable"
      ref="categoryTable"
      v-loading="loading"
      :data="categoryList"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children'}"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="title" label="类目标题" min-width="220" show-overflow-tooltip />
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['ssk:bookCategory:add']"
          >新增子类目</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ssk:bookCategory:edit']"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ssk:bookCategory:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗，通过ref调用open方法 -->
    <book-category-dialog ref="categoryDialog" @success="getList" />
  </div>
</template>

<script>
import { listBookCategory, delBookCategory } from "@/api/ssk/bookCategory"
import BookCategoryDialog from "@/components/ssk/BookCategoryDialog"

export default {
  name: "SskBookCategory",
  components: { BookCategoryDialog },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 类目树数据
      categoryList: [],
      // 表格多选选中的行
      multipleSelection: [],
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询类目树 */
    getList() {
      this.loading = true
      listBookCategory().then(response => {
        this.categoryList = response.data
        this.loading = false
      })
    },
    /** 多选框选中变化 */
    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    },
    /** 新增按钮操作，row存在时表示新增其子类目 */
    handleAdd(row) {
      this.$refs.categoryDialog.open("add", row)
    },
    /** 编辑按钮操作 */
    handleUpdate(row) {
      this.$refs.categoryDialog.open("edit", row)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      // 存在子类目的节点不允许删除，与后端校验保持一致
      if (row.children && row.children.length > 0) {
        this.$modal.msgWarning('类目"' + row.title + '"下存在子类目，请先删除子类目')
        return
      }
      this.$modal.confirm('是否确认删除类目"' + row.title + '"？').then(() => {
        return delBookCategory(row.id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 批量删除按钮操作 */
    handleBatchDelete() {
      // 勾选节点中只要有一个存在子类目则不允许删除
      const hasChildrenNode = this.multipleSelection.find(item => item.children && item.children.length > 0)
      if (hasChildrenNode) {
        this.$modal.msgWarning('类目"' + hasChildrenNode.title + '"下存在子类目，请先删除子类目')
        return
      }
      const ids = this.multipleSelection.map(item => item.id)
      this.$modal.confirm('是否确认删除选中的' + ids.length + '个类目？').then(() => {
        return delBookCategory(ids.join(","))
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    }
  }
}
</script>
