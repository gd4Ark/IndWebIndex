import _ from 'lodash'
import TinyPinyin from 'tiny-pinyin'

// 随机排序
export const randomSort = (arr) => _.shuffle(arr)

// 按 name 去重
export const unique = (arr) => _.uniqBy(arr, 'name')

// 提取 tag 列表
export const extractTags = (posts) => {
  // 获取所有非隐藏文章的标签
  const tags = _.chain(posts)
    .filter((post) => post.state !== '隐藏')
    .flatMap('tags') // 简化写法
    .uniq()
    .value()

  return sortTags(tags)
}

function sortTags(tags) {
  // 分离并排序字母和中文标签
  const [alphabetTags, chineseTags] = _.partition(tags, (tag) =>
    /^[a-zA-Z]/.test(tag)
  )

  // 字母标签排序（不区分大小写）
  const sortedAlphabetTags = alphabetTags.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )

  // 中文标签按拼音排序
  const sortedChineseTags = chineseTags.sort((a, b) =>
    TinyPinyin.convertToPinyin(a).localeCompare(TinyPinyin.convertToPinyin(b))
  )

  return [...sortedAlphabetTags, ...sortedChineseTags]
}

// 通过 tags 筛选
export const filterPostsByTags = (posts, tags) =>
  tags.length
    ? posts.filter((post) => tags.every((tag) => post.tags.includes(tag)))
    : posts

// 通过搜索筛选
export const filterPostsBySearch = (posts, query) => {
  if (!query) return posts
  if (query === '隐藏') return posts

  const lowerQuery = query.toLowerCase()
  const getPinyin = (str) => TinyPinyin.convertToPinyin(str || '')

  return posts.filter((post) => {
    const searchableContent = [
      post.name,
      post.web,
      ...post.tags,
      getPinyin(post.name),
      ...post.tags.map(getPinyin)
    ].map((str) => (str || '').toLowerCase())

    return searchableContent.some((content) => content.includes(lowerQuery))
  })
}

// 渲染标签
export const renderTags = (tags, onList, toggleTagButton) =>
  tags.map((tag, index) => (
    <button
      key={tag}
      id={`tag-${tag}`}
      className={`tag ${onList.includes(tag) ? 'on' : 'off'}`}
      onClick={() => toggleTagButton(tag)}
    >
      {tag}
    </button>
  ))

// 切换标签按钮
export const toggleTagButton = (tag, onList, setOnList, tags, setTags) => {
  const newOnList = _.xor(onList, [tag])
  setOnList(newOnList)
  const remainingTags = sortTags(tags.filter((t) => !newOnList.includes(t)))
  setTags([...newOnList, ...remainingTags])
}

// 更新结果
export const updateResults = (posts, onList, setFilteredPosts, setTags) => {
  const filtered = filterPostsByTags(posts, onList)
  setFilteredPosts(filtered)

  const availableTags = sortTags(
    _.chain(filtered).flatMap('tags').uniq().value()
  )

  setTags([...onList, ...availableTags.filter((tag) => !onList.includes(tag))])
}
