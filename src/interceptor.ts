import { ResponseInterceptor } from './utils/interceptor'

export function configureInterceptor(interceptor: ResponseInterceptor) {
  interceptor.on('/api/v3/user/settings', async (res) => {
    if (!res.originalData) {
      return
    }
  })

  interceptor.onRaw('/', async (res) => {
    if (res.originalResponse.includes('static.kookapp.cn')) {
      res.originalResponse = res.originalResponse.replaceAll('static.kookapp.cn', 'bifrost-api.vanillacake.cn/static')
    }
    if (res.originalResponse.includes('img.kookapp.cn')) {
      res.originalResponse = res.originalResponse.replaceAll('img.kookapp.cn', 'bifrost-api.vanillacake.cn/assets')
    }
  })

  interceptor.on('/api/v3/user/mail-list', async (res) => {
    res.originalData.data.items.push({
      id: 27801,
      show_type: 5,
      type: 10,
      target_id: '',
      title: '商城上新提醒',
      content: JSON.stringify({
        position: 'setting-mall',
        text: '新品',
        text_color: '#FFFFFFFF',
        text_bg_color: '#FF3200FF',
        desc: '21312',
        level: 0,
        guild_id: null,
        personal_center_red_dot: false,
        flag: '',
        tip_image: null,
        image_width: null,
        image_height: null,
        tip_title: '欢迎来到 Overlay 环境',
        tip_text: '此为 KOOK 线上环境的代理型私服，用于在不将功能上线的情况下，使用线上测试新功能。',
        card_type: 'big',
        buttons: [
          {
            style: 'primary',
            click_type: 'scheme',
            click_value:
              'https://www.kookapp.cn/direct/link?external=https://wiki.chuanyuapp.com/pages/viewpage.action?pageId=98578227',
            text: '什么意思',
          },
          {
            style: 'default',
            text: '好',
          },
        ],
        mobile_user_center_tips: null,
        click_jump_to: null,
      }),
      create_time: '2025-09-30 18:14:29',
      show_key: '',
      client: 3,
      priority: 1,
      resource: [],
      duration: 0,
      position_id: 0,
      message: {
        mention_all: false,
        mention_here: false,
        mention_roles: [],
        mention: [],
        kmarkdown: {
          mention_part: [],
          mention_role_part: [],
        },
      },
      start_time: 1759227269,
      end_time: 1788105600,
      need_read: true,
    })
  })
}
