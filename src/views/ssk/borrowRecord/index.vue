<template>
  <div class="app-container">
    <!-- 搜索条件 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item label="囚号" prop="prisonerNumber">
        <el-input
          v-model="queryParams.prisonerNumber"
          placeholder="请输入囚号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="书籍名称" prop="bookName">
        <el-input
          v-model="queryParams.bookName"
          placeholder="请输入书籍名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ssk:borrowRecord:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 借阅记录表格 -->
    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="囚号" align="center" prop="prisonerNumber" width="120" />
      <el-table-column label="书籍名称" align="center" prop="bookName" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="作者" align="center" prop="bookAuthor" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="书架号" align="center" prop="shelfCode" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.book_shelfs" :value="scope.row.shelfCode" />
        </template>
      </el-table-column>
      <el-table-column label="借出时间" align="center" prop="borrowTime" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.borrowTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应还时间" align="center" prop="returnTime" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.returnTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际归还时间" align="center" prop="actualReturnTime" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.actualReturnTime">{{ parseTime(scope.row.actualReturnTime) }}</span>
          <el-tag v-else type="danger" size="mini">未归还</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.actualReturnTime" type="success" size="mini">已归还</el-tag>
          <el-tag v-else :type="isOverdue(scope.row) ? 'danger' : 'warning'" size="mini">
            {{ isOverdue(scope.row) ? '已逾期' : '借阅中' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="!scope.row.actualReturnTime"
            size="mini"
            type="text"
            icon="el-icon-refresh-left"
            @click="handleReturn(scope.row)"
            v-hasPermi="['ssk:borrowRecord:return']"
          >还书</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ssk:borrowRecord:remove']"
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
  </div>
</template>

<script>
import { listBorrowRecord, delBorrowRecord, returnBook } from "@/api/ssk/borrowRecord"

export default {
  name: "SskBorrowRecord",
  dicts: ['book_shelfs'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 借阅记录列表
      recordList: [],
      // 选中的ID数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        prisonerNumber: undefined,
        bookName: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询借阅记录列表 */
    getList() {
      this.loading = true
      listBorrowRecord(this.queryParams).then(response => {
        this.recordList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 判断是否逾期 */
    isOverdue(row) {
      if (row.actualReturnTime) {
        return false
      }
      // 当前时间大于应还时间则逾期
      return new Date() > new Date(row.returnTime)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    /** 还书操作 */
    handleReturn(row) {
      this.$modal.confirm('是否确认归还书籍"' + row.bookName + '"？').then(() => {
        return returnBook(row.id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("还书成功")
      }).catch(() => {})
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除选中的借阅记录？').then(() => {
        return delBorrowRecord(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    }
  }
}
</script>
