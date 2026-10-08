import request from '@/utils/request'

// 分页查询借阅记录列表
export function listBorrowRecord(query) {
  return request({
    url: '/ssk/borrowRecord/list',
    method: 'get',
    params: query
  })
}

// 查询借阅记录详情
export function getBorrowRecord(id) {
  return request({
    url: '/ssk/borrowRecord/' + id,
    method: 'get'
  })
}

// 新增借阅记录
export function addBorrowRecord(data) {
  return request({
    url: '/ssk/borrowRecord',
    method: 'post',
    data: data
  })
}

// 修改借阅记录
export function updateBorrowRecord(data) {
  return request({
    url: '/ssk/borrowRecord',
    method: 'put',
    data: data
  })
}

// 删除借阅记录，多个ID以逗号分隔
export function delBorrowRecord(ids) {
  return request({
    url: '/ssk/borrowRecord/' + ids,
    method: 'delete'
  })
}

// 还书
export function returnBook(id) {
  return request({
    url: '/ssk/borrowRecord/return/' + id,
    method: 'put'
  })
}
