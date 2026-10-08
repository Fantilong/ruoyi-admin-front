import request from '@/utils/request'

// 查询图书类目树（一次性返回全部）
export function listBookCategory() {
  return request({
    url: '/ssk/bookCategory/list',
    method: 'get'
  })
}

// 查询图书类目详情
export function getBookCategory(id) {
  return request({
    url: '/ssk/bookCategory/' + id,
    method: 'get'
  })
}

// 新增图书类目
export function addBookCategory(data) {
  return request({
    url: '/ssk/bookCategory',
    method: 'post',
    data: data
  })
}

// 修改图书类目
export function updateBookCategory(data) {
  return request({
    url: '/ssk/bookCategory',
    method: 'put',
    data: data
  })
}

// 删除图书类目，多个ID以逗号分隔
export function delBookCategory(ids) {
  return request({
    url: '/ssk/bookCategory/' + ids,
    method: 'delete'
  })
}
