import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import Blog from './Blog'
import blogService from '../services/blogs'

describe('Blog component', () => {
  let blog, user, mockBlogs, mockSetBlogs

  beforeEach(() => {
    blog = {
      id: 'test-blog-id',
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 5,
      user: {
        username: 'testuser',
        name: 'Test User'
      }
    }

    user = {
      username: 'testuser',
      name: 'Test User'
    }

    mockBlogs = [blog]
    mockSetBlogs = vi.fn()

    // Mock the blogService.update function
    blogService.update = vi.fn().mockResolvedValue({ ...blog, likes: 6 })
  })

  it('renders blog title and author but does not render URL or likes by default', () => {
    render(
      <Blog
        blog={blog}
        blogs={mockBlogs}
        setBlogs={mockSetBlogs}
        user={user}
      />
    )

    // Check that title and author are rendered together in the default view
    expect(screen.getByText('Test Blog Title Test Author')).toBeVisible()

    // Check that URL is not visible by default
    expect(screen.queryByText('https://testblog.com')).not.toBeVisible()

    // Check that likes count is not visible by default
    expect(screen.queryByText('5')).not.toBeVisible()

    // Check that view button is present and visible
    const viewButton = screen.getByText('view')
    expect(viewButton).toBeVisible()

    // Check that hide button is not visible initially
    expect(screen.queryByText('hide')).not.toBeVisible()

    // Check that like button is not visible initially
    expect(screen.queryByText('like')).not.toBeVisible()

    // Check that remove button is not visible initially
    expect(screen.queryByText('remove')).not.toBeVisible()
  })

  it('shows all blog details when view button is clicked', () => {
    render(
      <Blog
        blog={blog}
        blogs={mockBlogs}
        setBlogs={mockSetBlogs}
        user={user}
      />
    )

    // Initially, details should be hidden
    expect(screen.queryByText('https://testblog.com')).not.toBeVisible()

    // Click the view button
    const viewButton = screen.getByText('view')
    fireEvent.click(viewButton)

    // Now all details should be visible
    expect(screen.getByText('https://testblog.com')).toBeVisible()
    expect(screen.getByText('5')).toBeVisible()
    expect(screen.getByText('Test Author')).toBeVisible()
    expect(screen.getByText('like')).toBeVisible()
    expect(screen.getByText('remove')).toBeVisible()

    // Hide button should be visible instead of view button
    expect(screen.getByText('hide')).toBeVisible()
    expect(screen.queryByText('view')).not.toBeVisible()
  })

  it('hides blog details when hide button is clicked', () => {
    render(
      <Blog
        blog={blog}
        blogs={mockBlogs}
        setBlogs={mockSetBlogs}
        user={user}
      />
    )

    // First, show the details
    const viewButton = screen.getByText('view')
    fireEvent.click(viewButton)

    // Verify details are visible
    expect(screen.getByText('https://testblog.com')).toBeVisible()

    // Click the hide button
    const hideButton = screen.getByText('hide')
    fireEvent.click(hideButton)

    // Details should be hidden again
    expect(screen.queryByText('https://testblog.com')).not.toBeVisible()
    expect(screen.queryByText('5')).not.toBeVisible()
    expect(screen.queryByText('Test Author')).not.toBeVisible()

    // View button should be visible again
    expect(screen.getByText('view')).toBeVisible()
    expect(screen.queryByText('hide')).not.toBeVisible()
  })

  it('does not show remove button when user is not the blog owner', () => {
    const differentUser = {
      username: 'differentuser',
      name: 'Different User'
    }

    render(
      <Blog
        blog={blog}
        blogs={mockBlogs}
        setBlogs={mockSetBlogs}
        user={differentUser}
      />
    )

    // Show details
    const viewButton = screen.getByText('view')
    fireEvent.click(viewButton)

    // Remove button should not be present for non-owner
    expect(screen.queryByText('remove')).toBeNull()
  })

  it('calls setBlogs handler twice when like button is clicked twice', async () => {
    render(
      <Blog
        blog={blog}
        blogs={mockBlogs}
        setBlogs={mockSetBlogs}
        user={user}
      />
    )

    // Show the blog details to access the like button
    const viewButton = screen.getByText('view')
    fireEvent.click(viewButton)

    // Find and click the like button twice
    const likeButton = screen.getByText('like')

    // Click the like button first time
    fireEvent.click(likeButton)

    // Wait a bit for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    // Click the like button second time
    fireEvent.click(likeButton)

    // Wait a bit for the second async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify that setBlogs was called twice
    expect(mockSetBlogs).toHaveBeenCalledTimes(2)
  })
})
