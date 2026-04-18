(() => {
  const getTopLocation = () => {
    try {
      return window.top?.location ?? window.location
    } catch {
      return window.location
    }
  }

  const getAppBase = () => getTopLocation().pathname.replace(/[^/]*$/, '')
  const normalizeRoute = (route) => (route.startsWith('/') ? route : `/${route}`)
  const getCurrentRoute = () => {
    const hashRoute = getTopLocation().hash.replace(/^#/, '')
    if (hashRoute) {
      return normalizeRoute(hashRoute)
    }

    return '/'
  }

  const buildAppHref = (route) => `${getAppBase()}#${normalizeRoute(route)}`

  const routeForLabel = {
    首页: '/',
    学习路径: '/learning-path',
    专题练习: '/practice',
    文档说明: '/docs',
    工作区: '/',
    开发文档: '/docs',
    技术文档: '/docs',
    线性结构: '/topic/linear',
    线性表: '/topic/linear',
    栈与队列: '/topic/stack-queue',
    栈: '/topic/stack-queue',
    队列: '/practice/bank-queue',
    树结构: '/topic/tree',
    树形结构: '/topic/tree',
    图结构: '/topic/graph',
    综合实践: '/topic/integrated',
    学生信息管理: '/practice/student-management',
    学生信息管理系统: '/practice/student-management',
    约瑟夫环: '/practice/josephus',
    表达式求值: '/practice/expression-evaluation',
    括号匹配: '/practice/bracket-matching',
    二叉搜索树: '/practice/binary-search-tree',
    二叉搜索树模拟: '/practice/binary-search-tree',
    银行排队系统: '/practice/bank-queue',
    最短路径搜索: '/practice/shortest-path',
    汉诺塔: '/practice/hanoi',
  }

  const pageName = location.pathname.split('/').pop() || ''

  const routeForCurrentPage = {
    'home.html': '/',
    'stack.html': '/topic/stack-queue',
    'student.html': '/practice/student-management',
    'josephus.html': '/practice/josephus',
    'expression.html': '/practice/expression-evaluation',
    'bracket.html': '/practice/bracket-matching',
    'bst.html': '/practice/binary-search-tree',
    'bank.html': '/practice/bank-queue',
    'shortest.html': '/practice/shortest-path',
    'hanoi.html': '/practice/hanoi',
  }

  const clean = (text) => text.replace(/\s+/g, ' ').trim()

  const toRoute = (text) => {
    const normalized = clean(text)

    if (routeForLabel[normalized]) {
      return routeForLabel[normalized]
    }

    const partial = Object.entries(routeForLabel).find(([label]) => normalized.includes(label))
    return partial?.[1] ?? null
  }

  const navigateTop = (href) => {
    const targetHref = buildAppHref(href)

    if (!href || window.top === window) {
      window.location.href = targetHref
      return
    }

    window.top.location.href = targetHref
  }

  const wireLinkLikeNode = (node, href) => {
    if (node.tagName === 'A') {
      node.setAttribute('href', buildAppHref(href))
      node.setAttribute('target', '_top')
      return
    }

    node.style.cursor = 'pointer'
    node.onclick = () => navigateTop(href)
  }

  const rewriteByText = () => {
    const candidates = Array.from(document.querySelectorAll('a, button, span'))

    for (const node of candidates) {
      const text = clean(node.textContent || '')
      if (!text) continue

      const href = toRoute(text)
      if (!href) continue

      if (node.tagName === 'BUTTON') {
        node.onclick = () => navigateTop(href)
        continue
      }

      wireLinkLikeNode(node, href)
    }
  }

  const markActiveNav = () => {
    const currentPath = getCurrentRoute() || routeForCurrentPage[pageName] || '/'
    const navNodes = Array.from(document.querySelectorAll('nav a, header a'))

    for (const node of navNodes) {
      const href = node.getAttribute('href')
      if (!href || href === '#') continue

      const active = href === currentPath
      if (!active) continue

      node.style.color = '#165DFF'
      node.style.borderColor = '#165DFF'
    }
  }

  const wireHomeCtas = () => {
    if (pageName !== 'home.html') {
      return
    }

    const buttons = Array.from(document.querySelectorAll('button, a'))

    for (const node of buttons) {
      const text = clean(node.textContent || '')

      if (text === '开始学习') {
        node.onclick = () => navigateTop('/topic/linear')
      }

      if (text === '查看演示') {
        node.onclick = () => navigateTop('/practice/student-management')
      }

      if (text.includes('进入专题') || text.includes('进入练习') || text.includes('进入实验')) {
        const cardText = clean(node.parentElement?.textContent || '')
        const href = toRoute(cardText)
        if (href) {
          node.onclick = () => navigateTop(href)
        }
      }

      if (text === '开始学习' || text === '开始探索' || text === '算法分析') {
        const cardText = clean(node.closest('div, article, section')?.textContent || '')
        const href = toRoute(cardText)
        if (href) {
          node.onclick = () => navigateTop(href)
        }
      }
    }
  }

  const scrollHomeSections = () => {
    if (pageName !== 'home.html') {
      return
    }

    const topPath = getCurrentRoute()
    const headingTargets = {
      '/learning-path': ['学习路径', '核心架构单元'],
      '/practice': ['继续探索', '核心架构单元'],
      '/docs': ['文档说明'],
    }

    const targets = headingTargets[topPath]
    if (!targets) return

    const headings = Array.from(document.querySelectorAll('h2, h3, p'))
    const match = headings.find((node) => targets.includes(clean(node.textContent || '')))
    match?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }

  const wireFooterFallbacks = () => {
    const footerLinks = Array.from(document.querySelectorAll('footer a'))
    for (const node of footerLinks) {
      if ((node.getAttribute('href') || '#') !== '#') continue
      node.setAttribute('href', buildAppHref('/'))
      node.setAttribute('target', '_top')
    }
  }

  const boot = () => {
    rewriteByText()
    wireHomeCtas()
    wireFooterFallbacks()
    markActiveNav()
    scrollHomeSections()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true })
  } else {
    boot()
  }

  window.addEventListener('codex:stitch-refresh', boot)
})()
