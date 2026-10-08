import request from '@/utils/request'

// 分页查询借阅申请列表
export function listBorrowRequest(query) {
  return request({
    url: '/ssk/borrowRequest/list',
    method: 'get',
    params: query
  })
}

// 查询借阅申请详情
export function getBorrowRequest(id) {
  return request({
    url: '/ssk/borrowRequest/' + id,
    method: 'get'
  })
}

// 同意申请，需传入囚号和借阅天数
export function approveBorrowRequest(id, prisonerNumber, borrowDays) {
  return request({
    url: '/ssk/borrowRequest/approve/' + id,
    method: 'post',
    params: { prisonerNumber: prisonerNumber, borrowDays: borrowDays }
  })
}

// 拒绝申请
export function rejectBorrowRequest(id) {
  return request({
    url: '/ssk/borrowRequest/reject/' + id,
    method: 'post'
  })
}

// 删除借阅申请，多个ID以逗号分隔
export function delBorrowRequest(ids) {
  return request({
    url: '/ssk/borrowRequest/' + ids,
    method: 'delete'
  })
}
