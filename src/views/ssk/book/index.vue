<template>
  <div class="app-container book-page">
    <el-row :gutter="16">
      <!-- 左侧：图书类目树 -->
      <el-col :span="5" :xs="24">
        <div class="left-tree-panel">
          <div class="tree-header">图书类目</div>
          <el-input
            v-model="categoryKeyword"
            placeholder="搜索类目名称"
            clearable
            size="mini"
            prefix-icon="el-icon-search"
            style="margin-bottom: 10px"
          />
          <el-tree
            ref="categoryTree"
            :data="categoryList"
            :props="treeProps"
            :filter-node-method="filterCategoryNode"
            :expand-on-click-node="false"
            :highlight-current="true"
            :default-expand-all="true"
            node-key="id"
            current-node-key="0"
            @node-click="handleCategoryClick"
          >
            <span slot-scope="{ node, data }" class="tree-node-label">
              <span>{{ data.id === 0 ? '全部图书' : data.title }}</span>
            </span>
          </el-tree>
        </div>
      </el-col>

      <!-- 右侧：图书列表 -->
      <el-col :span="19" :xs="24">
        <!-- 搜索条件 -->
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
          <el-form-item label="书籍名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入书籍名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="作者" prop="author">
            <el-input
              v-model="queryParams.author"
              placeholder="请输入作者"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="书架号" prop="shelfCode">
            <shelf-code-select v-model="queryParams.shelfCode" placeholder="请选择书架号" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 操作按钮 -->
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['ssk:book:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['ssk:book:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['ssk:book:remove']"
            >删除</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 图书表格 -->
        <el-table v-loading="loading" :data="bookList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" align="center" prop="id" width="60" />
          <el-table-column label="封面" align="center" width="80">
            <template slot-scope="scope">
              <el-image
                v-if="scope.row.cover"
                :src="baseUrl + scope.row.cover"
                :preview-src-list="[baseUrl + scope.row.cover]"
                style="width: 50px; height: 50px; border-radius: 4px"
                fit="contain"
              />
              <span v-else style="color: #ccc">无</span>
            </template>
          </el-table-column>
          <el-table-column label="书籍名称" align="center" prop="name" :show-overflow-tooltip="true" min-width="150" />
          <el-table-column label="作者" align="center" prop="author" :show-overflow-tooltip="true" width="120" />
          <el-table-column label="类目" align="center" prop="categoryTitles" :show-overflow-tooltip="true" min-width="120" />
          <el-table-column label="书架号" align="center" prop="shelfCode" width="90" />
          <el-table-column label="库存" align="center" prop="stockQuantity" width="70" />
          <el-table-column label="创建人" align="center" prop="createdByName" width="90" />
          <el-table-column label="创建时间" align="center" prop="createdAt" width="150">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新人" align="center" prop="updatedByName" width="90" />
          <el-table-column label="更新时间" align="center" prop="updatedAt" width="150">
            <template slot-scope="scope">
              <span>{{ scope.row.updatedAt ? parseTime(scope.row.updatedAt) : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['ssk:book:edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['ssk:book:remove']"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 新增/编辑弹窗 -->
    <book-dialog ref="bookDialog" @success="getList" />
  </div>
</template>

<script>
import { listBook, delBook } from "@/api/ssk/book"
import { listBookCategory } from "@/api/ssk/bookCategory"
import ShelfCodeSelect from "@/components/ssk/ShelfCodeSelect"
import BookDialog from "@/components/ssk/BookDialog"

export default {
  name: "SskBook",
  components: { ShelfCodeSelect, BookDialog },
  dicts: ['book_shelfs'],
  data() {
    return {
      // 图片baseUrl
      baseUrl: process.env.VUE_APP_BASE_API,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 图书列表数据
      bookList: [],
      // 选中的数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 类目树数据（含"全部"根节点）
      categoryList: [],
      // 类目搜索关键字
      categoryKeyword: "",
      // 当前选中的类目ID（0表示全部）
      currentCategoryId: "0",
      // 树配置
      treeProps: { label: "title", children: "children" },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        author: undefined,
        shelfCode: undefined,
        // 类目筛选通过categoryIds传递
        categoryIds: "0"
      }
    }
  },
  watch: {
    // 类目搜索过滤
    categoryKeyword(val) {
      this.$refs.categoryTree.filter(val)
    }
  },
  created() {
    this.getCategoryTree()
    this.getList()
  },
  methods: {
    /** 查询图书列表 */
    getList() {
      this.loading = true
      listBook(this.queryParams).then(response => {
        this.bookList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 加载类目树，在最前面增加"全部图书"根节点 */
    getCategoryTree() {
      listBookCategory().then(response => {
        const tree = response.data || []
        this.categoryList = [{ id: 0, title: "全部图书", children: tree }]
        // 默认高亮根节点
        this.$nextTick(() => {
          this.$refs.categoryTree.setCurrentKey("0")
        })
      })
    },
    /** 类目搜索过滤 */
    filterCategoryNode(value, data) {
      if (!value) return true
      const title = data.title || ""
      return title.indexOf(value) !== -1
    },
    /** 点击类目节点，筛选图书 */
    handleCategoryClick(data) {
      this.currentCategoryId = String(data.id)
      this.queryParams.categoryIds = this.currentCategoryId
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.queryParams.categoryIds = this.currentCategoryId
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      // 如果左侧选中了非根节点，则自动带入类目
      const selectedCategoryIds = this.currentCategoryId !== "0" ? this.currentCategoryId : ""
      this.$refs.bookDialog.open("add", null, selectedCategoryIds)
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const id = row.id || this.ids[0]
      this.$refs.bookDialog.open("edit", { id })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除选中的图书？').then(() => {
        return delBook(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.book-page {
  .left-tree-panel {
    background: #fff;
    border-radius: 4px;
    padding: 12px;
    min-height: calc(100vh - 120px);
    border-right: 1px solid #eee;
  }

  .tree-header {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #303133;
  }

  .tree-node-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
    overflow: hidden;
  }
}
</style>
