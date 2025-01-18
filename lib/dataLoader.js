import _ from 'lodash'
import TinyPinyin from 'tiny-pinyin'

// 随机排序
export const randomSort = (arr) => _.shuffle(arr)

// 按 name 去重
export const unique = (arr) => _.uniqBy(arr, 'name')

// 按字母和中文排序
export const sortByAlphabetAndChinese = (arr) => {
  // 自定义比较函数
  const compare = (a, b) => {
    const isAChinese = /[\u4e00-\u9fa5]/.test(a)
    const isBChinese = /[\u4e00-\u9fa5]/.test(b)

    // 如果a是字母，b是中文，a排在前面
    if (!isAChinese && isBChinese) return -1
    // 如果a是中文，b是字母，a排在后面
    if (isAChinese && !isBChinese) return 1

    // 都是字母，按字母顺序比较
    if (!isAChinese && !isBChinese) {
      return a.toLowerCase().localeCompare(b.toLowerCase())
    }

    // 都是中文，按拼音比较
    const pinyinA = TinyPinyin.convertToPinyin(a)
    const pinyinB = TinyPinyin.convertToPinyin(b)
    return pinyinA.localeCompare(pinyinB)
  }

  // 使用slice()创建副本并排序
  return arr.slice().sort(compare)
}

// 提取 tag 列表
export const extractTags = (posts) => {
  // 获取所有非隐藏文章的标签
  const tags = _.chain(posts)
    .filter((post) => post.state !== '隐藏')
    .flatMap((post) => post.tags)
    .uniq()
    .value()

  // 创建字母和中文标签数组
  const alphabetTags = []
  const chineseTags = []

  // 分离字母和中文标签
  for (const tag of tags) {
    if (/^[a-zA-Z]/.test(tag)) {
      alphabetTags.push(tag)
    } else if (/[\u4e00-\u9fa5]/.test(tag)) {
      chineseTags.push(tag)
    }
  }

  // 字母标签排序（不区分大小写）
  alphabetTags.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )

  // 中文标签按拼音排序
  chineseTags.sort((a, b) => {
    const pinyinA = TinyPinyin.convertToPinyin(a)
    const pinyinB = TinyPinyin.convertToPinyin(b)
    return pinyinA.localeCompare(pinyinB)
  })

  // 返回合并后的结果
  return [...alphabetTags, ...chineseTags]
}

// 通过 tags 筛选
export const filterPostsByTags = (posts, tags) => {
  return posts.filter((post) => tags.every((tag) => post.tags.includes(tag)))
}

// 通过搜索筛选
export const filterPostsBySearch = (posts, query) => {
  if (query === '隐藏') {
    return posts
  }
  const lowerQuery = query.toLowerCase()
  return posts.filter((post) => {
    const namePinyin = TinyPinyin.convertToPinyin(post.name || '')
    const tagsPinyin = post.tags.map((tag) =>
      TinyPinyin.convertToPinyin(tag || '')
    )

    return (
      post.name.toLowerCase().includes(lowerQuery) ||
      post.web.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      namePinyin.toLowerCase().includes(lowerQuery) ||
      tagsPinyin.some((tagPinyin) =>
        tagPinyin.toLowerCase().includes(lowerQuery)
      )
    )
  })
}

// 渲染标签
export const renderTags = (tags, onList, toggleTagButton) => {
  return tags.map((tag, index) => (
    <button
      key={index}
      id={`tag${index}`}
      className={onList.includes(tag) ? 'tag on' : 'tag off'}
      onClick={() => toggleTagButton(tag)}
    >
      {tag}
    </button>
  ))
}

// 切换标签按钮
export const toggleTagButton = (tag, onList, setOnList, tags, setTags) => {
  const newOnList = _.xor(onList, [tag])
  setOnList(newOnList)
  const sortedTags = newOnList.concat(
    tags.filter((t) => !newOnList.includes(t))
  )
  setTags(sortedTags)
}

// 更新结果
export const updateResults = (posts, onList, setFilteredPosts, setTags) => {
  const filtered = posts.filter((post) =>
    onList.every((tag) => post.tags.includes(tag))
  )
  setFilteredPosts(filtered)
  const availableTags = _.uniq(_.flatMap(filtered, 'tags'))
  const sortedTags = onList.concat(
    availableTags.filter((tag) => !onList.includes(tag))
  )
  setTags(sortedTags)
}
