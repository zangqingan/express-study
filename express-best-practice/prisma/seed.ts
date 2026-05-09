// prisma/seed.ts
// 引入prisma实例
import { prisma } from "./lib/index.js";

async function main() {
  // 清空数据（按外键依赖逆序）
  await prisma.sysUserRole.deleteMany();
  await prisma.sysRoleMenu.deleteMany();
  await prisma.sysMenu.deleteMany();
  await prisma.sysRole.deleteMany()
  await prisma.sysUser.deleteMany();

  // ========== 1. 用户 ==========
  await prisma.sysUser.createMany({
    data: [
      {
        user_id: 1,
        dept_id: 103,
        user_name: 'admin',
        nick_name: '若依',
        user_type: '00',
        email: 'ry@163.com',
        phone_number: '15888888888',
        sex: '1',
        avatar: '',
        password: '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2',
        status: '0',
        del_flag: '0',
        login_ip: '127.0.0.1',
        login_date: new Date(),
        pwd_update_date: new Date(),
        create_by: 'admin',
        create_time: new Date(),
        update_by: '',
        update_time: null,
        remark: '管理员',
      },
      {
        user_id: 2,
        dept_id: 105,
        user_name: 'ry',
        nick_name: '若依',
        user_type: '00',
        email: 'ry@qq.com',
        phone_number: '15666666666',
        sex: '1',
        avatar: '',
        password: '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2',
        status: '0',
        del_flag: '0',
        login_ip: '127.0.0.1',
        login_date: new Date(),
        pwd_update_date: new Date(),
        create_by: 'admin',
        create_time: new Date(),
        update_by: '',
        update_time: null,
        remark: '测试员',
      },
    ],
  });

  // ========== 2. 角色 ==========
  await prisma.sysRole.createMany({
    data: [
      {
        role_id: 1,
        role_name: '超级管理员',
        role_key: 'admin',
        role_sort: 1,
        data_scope: '1',
        menu_check_strictly: true,
        dept_check_strictly: true,
        status: '0',
        del_flag: '0',
        create_by: 'admin',
        create_time: new Date(),
        update_by: '',
        update_time: null,
        remark: '超级管理员',
      },
      {
        role_id: 2,
        role_name: '普通角色',
        role_key: 'common',
        role_sort: 2,
        data_scope: '2',
        menu_check_strictly: true,
        dept_check_strictly: true,
        status: '0',
        del_flag: '0',
        create_by: 'admin',
        create_time: new Date(),
        update_by: '',
        update_time: null,
        remark: '普通角色',
      },
    ],
  });

  // ========== 3. 菜单（全部 69 条） ==========
  await prisma.sysMenu.createMany({
    data: [
      // --- 一级菜单 ---
      { menu_id: 1, menu_name: '系统管理', parent_id: 0, order_num: 1, path: 'system', component: null, query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'M', visible: '0', status: '0', perms: '', icon: 'system', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '系统管理目录' },
      { menu_id: 2, menu_name: '系统监控', parent_id: 0, order_num: 2, path: 'monitor', component: null, query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'M', visible: '0', status: '0', perms: '', icon: 'monitor', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '系统监控目录' },
      { menu_id: 3, menu_name: '系统工具', parent_id: 0, order_num: 3, path: 'tool', component: null, query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'M', visible: '0', status: '0', perms: '', icon: 'tool', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '系统工具目录' },
      { menu_id: 4, menu_name: '若依官网', parent_id: 0, order_num: 4, path: 'http://ruoyi.vip', component: null, query: '', route_name: '', is_frame: 0, is_cache: 0, menu_type: 'M', visible: '0', status: '0', perms: '', icon: 'guide', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '若依官网地址' },
      // --- 二级菜单 ---
      { menu_id: 100, menu_name: '用户管理', parent_id: 1, order_num: 1, path: 'user', component: 'system/user/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'system:user:list', icon: 'user', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '用户管理菜单' },
      { menu_id: 101, menu_name: '角色管理', parent_id: 1, order_num: 2, path: 'role', component: 'system/role/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'system:role:list', icon: 'peoples', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '角色管理菜单' },
      { menu_id: 102, menu_name: '菜单管理', parent_id: 1, order_num: 3, path: 'menu', component: 'system/menu/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'system:menu:list', icon: 'tree-table', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '菜单管理菜单' },
      { menu_id: 103, menu_name: '部门管理', parent_id: 1, order_num: 4, path: 'dept', component: 'system/dept/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'system:dept:list', icon: 'tree', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '部门管理菜单' },
      { menu_id: 104, menu_name: '岗位管理', parent_id: 1, order_num: 5, path: 'post', component: 'system/post/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'system:post:list', icon: 'post', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '岗位管理菜单' },
      { menu_id: 105, menu_name: '字典管理', parent_id: 1, order_num: 6, path: 'dict', component: 'system/dict/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'system:dict:list', icon: 'dict', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '字典管理菜单' },
      { menu_id: 106, menu_name: '参数设置', parent_id: 1, order_num: 7, path: 'config', component: 'system/config/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'system:config:list', icon: 'edit', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '参数设置菜单' },
      { menu_id: 107, menu_name: '通知公告', parent_id: 1, order_num: 8, path: 'notice', component: 'system/notice/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'system:notice:list', icon: 'message', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '通知公告菜单' },
      { menu_id: 108, menu_name: '日志管理', parent_id: 1, order_num: 9, path: 'log', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'M', visible: '0', status: '0', perms: '', icon: 'log', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '日志管理菜单' },
      { menu_id: 109, menu_name: '在线用户', parent_id: 2, order_num: 1, path: 'online', component: 'monitor/online/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'monitor:online:list', icon: 'online', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '在线用户菜单' },
      { menu_id: 110, menu_name: '定时任务', parent_id: 2, order_num: 2, path: 'job', component: 'monitor/job/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'monitor:job:list', icon: 'job', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '定时任务菜单' },
      { menu_id: 111, menu_name: '数据监控', parent_id: 2, order_num: 3, path: 'druid', component: 'monitor/druid/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'monitor:druid:list', icon: 'druid', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '数据监控菜单' },
      { menu_id: 112, menu_name: '服务监控', parent_id: 2, order_num: 4, path: 'server', component: 'monitor/server/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'monitor:server:list', icon: 'server', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '服务监控菜单' },
      { menu_id: 113, menu_name: '缓存监控', parent_id: 2, order_num: 5, path: 'cache', component: 'monitor/cache/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'monitor:cache:list', icon: 'redis', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '缓存监控菜单' },
      { menu_id: 114, menu_name: '缓存列表', parent_id: 2, order_num: 6, path: 'cacheList', component: 'monitor/cache/list', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'monitor:cache:list', icon: 'redis-list', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '缓存列表菜单' },
      { menu_id: 115, menu_name: '表单构建', parent_id: 3, order_num: 1, path: 'build', component: 'tool/build/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'tool:build:list', icon: 'build', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '表单构建菜单' },
      { menu_id: 116, menu_name: '代码生成', parent_id: 3, order_num: 2, path: 'gen', component: 'tool/gen/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'tool:gen:list', icon: 'code', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '代码生成菜单' },
      { menu_id: 117, menu_name: '系统接口', parent_id: 3, order_num: 3, path: 'swagger', component: 'tool/swagger/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'tool:swagger:list', icon: 'swagger', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '系统接口菜单' },
      // --- 三级菜单 ---
      { menu_id: 500, menu_name: '操作日志', parent_id: 108, order_num: 1, path: 'operlog', component: 'monitor/operlog/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'monitor:operlog:list', icon: 'form', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '操作日志菜单' },
      { menu_id: 501, menu_name: '登录日志', parent_id: 108, order_num: 2, path: 'logininfor', component: 'monitor/logininfor/index', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'C', visible: '0', status: '0', perms: 'monitor:logininfor:list', icon: 'logininfor', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '登录日志菜单' },
      // --- 按钮（F 类型）---
      { menu_id: 1000, menu_name: '用户查询', parent_id: 100, order_num: 1, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:user:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1001, menu_name: '用户新增', parent_id: 100, order_num: 2, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:user:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1002, menu_name: '用户修改', parent_id: 100, order_num: 3, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:user:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1003, menu_name: '用户删除', parent_id: 100, order_num: 4, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:user:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1004, menu_name: '用户导出', parent_id: 100, order_num: 5, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:user:export', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1005, menu_name: '用户导入', parent_id: 100, order_num: 6, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:user:import', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1006, menu_name: '重置密码', parent_id: 100, order_num: 7, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:user:resetPwd', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1007, menu_name: '角色查询', parent_id: 101, order_num: 1, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:role:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1008, menu_name: '角色新增', parent_id: 101, order_num: 2, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:role:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1009, menu_name: '角色修改', parent_id: 101, order_num: 3, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:role:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1010, menu_name: '角色删除', parent_id: 101, order_num: 4, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:role:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1011, menu_name: '角色导出', parent_id: 101, order_num: 5, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:role:export', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1012, menu_name: '菜单查询', parent_id: 102, order_num: 1, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:menu:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1013, menu_name: '菜单新增', parent_id: 102, order_num: 2, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:menu:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1014, menu_name: '菜单修改', parent_id: 102, order_num: 3, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:menu:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1015, menu_name: '菜单删除', parent_id: 102, order_num: 4, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:menu:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1016, menu_name: '部门查询', parent_id: 103, order_num: 1, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dept:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1017, menu_name: '部门新增', parent_id: 103, order_num: 2, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dept:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1018, menu_name: '部门修改', parent_id: 103, order_num: 3, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dept:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1019, menu_name: '部门删除', parent_id: 103, order_num: 4, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dept:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1020, menu_name: '岗位查询', parent_id: 104, order_num: 1, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:post:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1021, menu_name: '岗位新增', parent_id: 104, order_num: 2, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:post:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1022, menu_name: '岗位修改', parent_id: 104, order_num: 3, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:post:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1023, menu_name: '岗位删除', parent_id: 104, order_num: 4, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:post:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1024, menu_name: '岗位导出', parent_id: 104, order_num: 5, path: '', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:post:export', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1025, menu_name: '字典查询', parent_id: 105, order_num: 1, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dict:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1026, menu_name: '字典新增', parent_id: 105, order_num: 2, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dict:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1027, menu_name: '字典修改', parent_id: 105, order_num: 3, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dict:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1028, menu_name: '字典删除', parent_id: 105, order_num: 4, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dict:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1029, menu_name: '字典导出', parent_id: 105, order_num: 5, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:dict:export', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1030, menu_name: '参数查询', parent_id: 106, order_num: 1, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:config:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1031, menu_name: '参数新增', parent_id: 106, order_num: 2, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:config:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1032, menu_name: '参数修改', parent_id: 106, order_num: 3, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:config:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1033, menu_name: '参数删除', parent_id: 106, order_num: 4, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:config:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1034, menu_name: '参数导出', parent_id: 106, order_num: 5, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:config:export', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1035, menu_name: '公告查询', parent_id: 107, order_num: 1, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:notice:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1036, menu_name: '公告新增', parent_id: 107, order_num: 2, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:notice:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1037, menu_name: '公告修改', parent_id: 107, order_num: 3, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:notice:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1038, menu_name: '公告删除', parent_id: 107, order_num: 4, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'system:notice:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1039, menu_name: '操作查询', parent_id: 500, order_num: 1, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:operlog:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1040, menu_name: '操作删除', parent_id: 500, order_num: 2, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:operlog:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1041, menu_name: '日志导出', parent_id: 500, order_num: 3, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:operlog:export', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1042, menu_name: '登录查询', parent_id: 501, order_num: 1, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:logininfor:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1043, menu_name: '登录删除', parent_id: 501, order_num: 2, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:logininfor:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1044, menu_name: '日志导出', parent_id: 501, order_num: 3, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:logininfor:export', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1045, menu_name: '账户解锁', parent_id: 501, order_num: 4, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:logininfor:unlock', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1046, menu_name: '在线查询', parent_id: 109, order_num: 1, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:online:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1047, menu_name: '批量强退', parent_id: 109, order_num: 2, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:online:batchLogout', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1048, menu_name: '单条强退', parent_id: 109, order_num: 3, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:online:forceLogout', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1049, menu_name: '任务查询', parent_id: 110, order_num: 1, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:job:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1050, menu_name: '任务新增', parent_id: 110, order_num: 2, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:job:add', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1051, menu_name: '任务修改', parent_id: 110, order_num: 3, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:job:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1052, menu_name: '任务删除', parent_id: 110, order_num: 4, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:job:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1053, menu_name: '状态修改', parent_id: 110, order_num: 5, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:job:changeStatus', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1054, menu_name: '任务导出', parent_id: 110, order_num: 6, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'monitor:job:export', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1055, menu_name: '生成查询', parent_id: 116, order_num: 1, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'tool:gen:query', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1056, menu_name: '生成修改', parent_id: 116, order_num: 2, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'tool:gen:edit', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1057, menu_name: '生成删除', parent_id: 116, order_num: 3, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'tool:gen:remove', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1058, menu_name: '导入代码', parent_id: 116, order_num: 4, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'tool:gen:import', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1059, menu_name: '预览代码', parent_id: 116, order_num: 5, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'tool:gen:preview', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
      { menu_id: 1060, menu_name: '生成代码', parent_id: 116, order_num: 6, path: '#', component: '', query: '', route_name: '', is_frame: 1, is_cache: 0, menu_type: 'F', visible: '0', status: '0', perms: 'tool:gen:code', icon: '#', create_by: 'admin', create_time: new Date(), update_by: '', update_time: null, remark: '' },
    ],
  });

  // ========== 4. 用户角色关联 ==========
  await prisma.sysUserRole.createMany({
    data: [
      { user_id: 1, role_id: 1 },
      { user_id: 2, role_id: 2 },
    ],
  });

  // ========== 5. 角色菜单关联（仅普通角色 role_id=2） ==========
  // 提取所有菜单 ID（共 69 条）
  const menuIds = [1, 2, 3, 4, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 500, 501, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1060];
  await prisma.sysRoleMenu.createMany({
    data: menuIds.map(menu_id => ({
      role_id: 2,
      menu_id: menu_id,
    })),
  });

  console.log('✅ 种子数据初始化完成！');
  console.log('   管理员账号: admin / admin123 (密文已注入)');
  console.log('   测试员账号: ry   / admin123');
  console.log('   角色: 1-超级管理员, 2-普通角色');
  console.log('   已为普通角色分配所有菜单权限。');
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });