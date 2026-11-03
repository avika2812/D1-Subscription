
import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Group,
  MultiSelect,
  Popover,
  Select,
  Stack,
  Text
} from '@mantine/core'
import './BrowsePosts.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function BrowsePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [filterOpened, setFilterOpened] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  // Hide and expand states
  const [hiddenPosts, setHiddenPosts] = useState([])
  const [expandedPosts, setExpandedPosts] = useState([])

  // Count active filters
  const activeFilterCount = [
    selectedFilters.includes('Date') && selectedDate,
    selectedFilters.includes('Post Type') && selectedType,
    selectedFilters.includes('Plan') && selectedPlan,
    selectedFilters.includes('Tags') && selectedTags.length > 0
  ].filter(Boolean).length

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(`${API_URL}/posts`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
        })

        if (!response.ok) {
          throw new Error('Unable to fetch posts')
        }

        const data = await response.json()

        console.log('Backend response:', data)

        // Handle different response formats
        if (Array.isArray(data)) {
          setPosts(data)
        } else if (Array.isArray(data.posts)) {
          setPosts(data.posts)
        } else {
          console.error('Posts response is not an array:', data)
          setPosts([])
        }

      } catch (error) {
        console.error('Error fetching posts:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Get all unique tags
  const allTags = [
    ...new Set(
      posts.flatMap(post =>
        Array.isArray(post.tags) ? post.tags : []
      )
    )
  ]

  // Apply filters
  const filteredPosts = posts.filter(post => {
    const postDate = post.createdAt &&
      !Number.isNaN(new Date(post.createdAt).getTime())
      ? new Date(post.createdAt).toISOString().split('T')[0]
      : ''

    const matchesDate =
      !selectedFilters.includes('Date') ||
      !selectedDate ||
      postDate === selectedDate

    const matchesType =
      !selectedFilters.includes('Post Type') ||
      !selectedType ||
      post.type === selectedType

    const matchesPlan =
      !selectedFilters.includes('Plan') ||
      !selectedPlan ||
      post.plan === selectedPlan

    const matchesTags =
      !selectedFilters.includes('Tags') ||
      selectedTags.length === 0 ||
      selectedTags.some(tag =>
        (Array.isArray(post.tags) ? post.tags : []).includes(tag)
      )

    return (
      matchesDate &&
      matchesType &&
      matchesPlan &&
      matchesTags
    )
  })

  // Hide a post without deleting it
  const hidePost = (postId) => {
    setHiddenPosts(prev => [...prev, postId])
  }

  // Reset hidden posts
  const resetHiddenPosts = () => {
    setHiddenPosts([])
  }

  // Expand or collapse a post
  const toggleExpand = (postId) => {
    setExpandedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedFilters([])
    setSelectedDate('')
    setSelectedType('')
    setSelectedPlan('')
    setSelectedTags([])
    setFilterOpened(false)
  }

  // Posts visible after hiding
  const visiblePosts = filteredPosts.filter(
    post => !hiddenPosts.includes(post.id)
  )

  if (loading) {
    return <p className="browse-loading">Loading posts...</p>
  }

  return (
    <div className="browse-container">

      {/* Page heading */}
      <div className="browse-heading">
        <h1>Browse Posts</h1>
        <p>Explore articles and questions from the DEV@Deakin community.</p>
      </div>

      {/* Filter section */}
      <div className="browse-filter-section">

        <Popover
          opened={filterOpened}
          onChange={setFilterOpened}
          position="bottom-start"
          width={320}
          shadow="md"
        >
          <Popover.Target>
            <Button
              onClick={() => setFilterOpened(!filterOpened)}
              variant="outline"
              color="teal"
            >
              <Group gap="xs">
                Filters

                {activeFilterCount > 0 && (
                  <Badge
                    color="teal"
                    variant="filled"
                    size="sm"
                    circle
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Group>
            </Button>
          </Popover.Target>

          <Popover.Dropdown>
            <Stack gap="sm">

              <Text fw={600}>Choose Filters</Text>

              <MultiSelect
                placeholder="Select filter categories"
                data={['Date', 'Post Type', 'Plan', 'Tags']}
                value={selectedFilters}
                onChange={setSelectedFilters}
                clearable
                comboboxProps={{ withinPortal: false }}
              />

              {selectedFilters.includes('Date') && (
                <div>
                  <Text size="sm" fw={500}>Select Date</Text>
                  <input
                    type="date"
                    className="browse-date-input"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>
              )}

              {selectedFilters.includes('Post Type') && (
                <Select
                  label="Post Type"
                  placeholder="Choose post type"
                  data={[
                    { value: 'question', label: 'Question' },
                    { value: 'article', label: 'Article' }
                  ]}
                  value={selectedType}
                  onChange={setSelectedType}
                  clearable
                  comboboxProps={{ withinPortal: false }}
                />
              )}

              {selectedFilters.includes('Plan') && (
                <Select
                  label="Plan"
                  placeholder="Choose plan"
                  data={['Free', 'Paid']}
                  value={selectedPlan}
                  onChange={setSelectedPlan}
                  clearable
                  comboboxProps={{ withinPortal: false }}
                />
              )}

              {selectedFilters.includes('Tags') && (
                <MultiSelect
                  label="Tags"
                  placeholder="Choose tags"
                  data={allTags}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  clearable
                  comboboxProps={{ withinPortal: false }}
                />
              )}

              <Button
                color="teal"
                onClick={() => setFilterOpened(false)}
              >
                Apply
              </Button>

              <Button
                variant="light"
                color="gray"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>

            </Stack>
          </Popover.Dropdown>
        </Popover>

        <Button
          variant="light"
          color="gray"
          onClick={resetHiddenPosts}
          disabled={hiddenPosts.length === 0}
        >
          Reset Hidden Posts
        </Button>

      </div>

      {/* Posts section */}
      <div className="browse-posts-list">

        {visiblePosts.length === 0 ? (
          <p className="no-posts">No posts found.</p>
        ) : (
          visiblePosts.map(post => {
            const isExpanded = expandedPosts.includes(post.id)

            return (
              <div className="browse-post-card" key={post.id}>

                {/* Post type at the top */}
                <p className="browse-post-type">
                  {post.type === 'question' ? 'Question' : 'Article'}
                </p>

                {/* Title and actions */}
                <div className="browse-post-header">

                  <h3>{post.title}</h3>

                  <div className="post-card-actions">
                    <Badge
                      color={post.plan === 'Paid' ? 'grape' : 'teal'}
                    >
                      {post.plan}
                    </Badge>

                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => hidePost(post.id)}
                    >
                      Hide
                    </Button>
                  </div>

                </div>

                {/* Tags */}
                <Group gap="xs" mt="xs">
                  {(Array.isArray(post.tags) ? post.tags : []).map(
                    (tag, index) => (
                      <Badge
                        key={index}
                        variant="light"
                        color="gray"
                      >
                        {tag}
                      </Badge>
                    )
                  )}
                </Group>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="post-content">

                    {post.type === 'question' && (
                      <p>{post.text}</p>
                    )}

                    {post.type === 'article' && (
                      <>
                        {post.abstract && (
                          <div className="article-abstract">
                            <strong>Abstract:</strong>
                            <p>{post.abstract}</p>
                          </div>
                        )}

                        <div className="article-full-content">
                          <strong>Article:</strong>
                          <p>{post.article}</p>
                        </div>
                      </>
                    )}

                  </div>
                )}

                {/* Read More / Show Less */}
                <Button
                  size="sm"
                  variant="subtle"
                  color="teal"
                  mt="md"
                  onClick={() => toggleExpand(post.id)}
                >
                  {isExpanded ? 'Show Less' : 'Read More'}
                </Button>

                {/* Date and Author */}
                <Group
                  justify="space-between"
                  mt="md"
                  className="post-date"
                >
                  <Text size="xs" c="dimmed">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : 'Date unavailable'}
                  </Text>

                  <Text size="xs" c="dimmed" fw={500}>
                    By {post.authorName || 'Community Member'}
                  </Text>
                </Group>

              </div>
            )
          })
        )}

      </div>

    </div>
  )
}

export default BrowsePosts
