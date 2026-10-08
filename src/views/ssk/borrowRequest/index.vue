<template>
  <div class="app-container">
    <!-- 搜索条件 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item label="书籍名称" prop="bookName">
        <el-input
          v-model="queryParams.bookName"
          placeholder="请输入书籍名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="申请状态" clearable style="width: 160px">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="ready" />
          <el-option label="已同意" value="resolved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
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
          v-hasPermi="['ssk:borrowRequest:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 借阅申请表格 -->
    <el-table v-loading="loading" :data="requestList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="书籍名称" align="center" prop="bookName" :show-overflow-tooltip="true" min-width="160" />
      <el-table-column label="作者" align="center" prop="bookAuthor" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="书架号" align="center" prop="shelfCode" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.book_shelfs" :value="scope.row.shelfCode" />
        </template>
      </el-table-column>
      <el-table-column label="库存" align="center" prop="stockQuantity" width="80" />
      <el-table-column label="申请时间" align="center" prop="createdAt" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="mini">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 'ready'"
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="handleApprove(scope.row)"
            v-hasPermi="['ssk:borrowRequest:approve']"
          >同意</el-button>
          <el-button
            v-if="scope.row.status === 'ready'"
            size="mini"
            type="text"
            icon="el-icon-close"
            @click="handleReject(scope.row)"
            v-hasPermi="['ssk:borrowRequest:reject']"
          >拒绝</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ssk:borrowRequest:remove']"
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

    <!-- 同意申请弹窗 -->
    <borrow-request-approve-dialog ref="approveDialog" @success="getList" />
  </div>
</template>

<script>
import { listBorrowRequest, delBorrowRequest, rejectBorrowRequest } from "@/api/ssk/borrowRequest"
import BorrowRequestApproveDialog from "@/components/ssk/BorrowRequestApproveDialog"

// 借阅申请状态映射，与后端枚举 SskBorrowRequestStatus 保持一致
const STATUS_MAP = {
  ready: { label: "待处理", type: "warning" },
  resolved: { label: "已同意", type: "success" },
  rejected: { label: "已拒绝", type: "danger" }
}

export default {
  name: "SskBorrowRequest",
  components: { BorrowRequestApproveDialog },
  dicts: ['book_shelfs'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 借阅申请列表
      requestList: [],
      // 选中的ID数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 查询参数，状态默认筛选待处理
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        bookName: undefined,
        status: "ready"
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询借阅申请列表 */
    getList() {
      this.loading = true
      listBorrowRequest(this.queryParams).then(response => {
        this.requestList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 获取状态标签文案 */
    getStatusLabel(status) {
      return (STATUS_MAP[status] && STATUS_MAP[status].label) || status
    },
    /** 获取状态标签颜色 */
    getStatusType(status) {
      return (STATUS_MAP[status] && STATUS_MAP[status].type) || "info"
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      // 重置后状态默认待处理
      this.queryParams.status = "ready"
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    /** 同意申请 */
    handleApprove(row) {
      this.$refs.approveDialog.open(row)
    },
    /** 拒绝申请，二次确认 */
    handleReject(row) {
      this.$modal.confirm('确认拒绝本次借阅申请吗？').then(() => {
        return rejectBorrowRequest(row.id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("已拒绝该申请")
      }).catch(() => {})
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除选中的借阅申请？').then(() => {
        return delBorrowRequest(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    }
  }
}
</script>
