import _ from 'lodash'
import TinyPinyin from 'tiny-pinyin'

// 随机排序
export const randomSort = (arr) => _.shuffle(arr)

// 按 name 去重
export const unique = (arr) => _.uniqBy(arr, 'name')

// 按字母和中文排序
export const sortByAlphabetAndChinese = (arr) => {
  // 将数组分为字母和中文两部分
  const [alphabetItems, chineseItems] = _.partition(
    arr,
    (item) => !/[\u4e00-\u9fa5]/.test(item)
  )

  // 分别排序
  const sortedAlphabet = _.sortBy(alphabetItems, (item) => item.toLowerCase())
  const sortedChinese = _.sortBy(chineseItems, (item) =>
    TinyPinyin.convertToPinyin(item)
  )

  // 合并结果，字母在前
  return [...sortedAlphabet, ...sortedChinese]
}

// 提取 tag 列表
export const extractTags = (posts) => {
  return _.chain(posts)
    .filter((post) => post.state !== '隐藏')
    .flatMap((post) => post.tags)
    .uniq()
    .value()
    .sort(sortByAlphabetAndChinese)
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
