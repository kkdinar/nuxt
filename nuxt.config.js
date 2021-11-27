const config = require('./config.js');

export default {
    // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
    ssr: false,

    // Global page headers (https://go.nuxtjs.dev/config-head)
    head: {
        title: 'Assistant',
        meta: [{
                charset: 'utf-8'
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                hid: 'description',
                name: 'description',
                content: ''
            }
        ],
        link: [{
            rel: 'icon',
            type: 'image/x-icon',
            href: '/favicon.ico'
        }]
    },

    // Global CSS (https://go.nuxtjs.dev/config-css)
    css: [],

    // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
    plugins: [],

    // Auto import components (https://go.nuxtjs.dev/config-components)
    components: true,

    // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
    buildModules: [],

    primevue: {
        theme: config.primevueTheme,
        ripple: true,
        components: ['InputText', 'Button', 'Toast', 'DataTable', 'Column', 'AutoComplete', 'Message', 'Textarea', 'Toolbar', 'Dropdown', 'Checkbox', 'Calendar', 'FileUpload', 'Password'],
    },

    // Modules (https://go.nuxtjs.dev/config-modules)
    modules: [
        'primevue/nuxt',
        '@nuxtjs/axios',
    ],

    axios: {
        baseURL: config.baseURL
    },

    // Build Configuration (https://go.nuxtjs.dev/config-build)
    build: {},

    target: 'static',

    server: {
        "host": "127.0.0.1",
        "port": config.serverPort
    }
}
