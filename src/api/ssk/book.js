import request from '@/utils/request'

// 分页查询图书列表
export function listBook(query) {
  return request({
    url: '/ssk/book/list',
    method: 'get',
    params: query
  })
}

// 查询图书详情
export function getBook(id) {
  return request({
    url: '/ssk/book/' + id,
    method: 'get'
  })
}

// 新增图书
export function addBook(data) {
  return request({
    url: '/ssk/book',
    method: 'post',
    data: data
  })
}

// 修改图书
export function updateBook(data) {
  return request({
    url: '/ssk/book',
    method: 'put',
    data: data
  })
}

// 删除图书，多个ID以逗号分隔
export function delBook(ids) {
  return request({
    url: '/ssk/book/' + ids,
    method: 'delete'
  })
}
