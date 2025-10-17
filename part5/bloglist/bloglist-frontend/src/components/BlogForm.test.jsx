import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import BlogForm from './BlogForm'
import blogService from '../services/blogs'

describe('BlogForm component', () => {
  let mockSetMsg, mockSetMsgStatus, mockBlogs, mockSetBlogs

  beforeEach(() => {
    mockSetMsg = vi.fn()
    mockSetMsgStatus = vi.fn()
    mockBlogs = []
    mockSetBlogs = vi.fn()

    // Mock the blogService.create function
    blogService.create = vi.fn().mockResolvedValue({
      id: 'new-blog-id',
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 0
    })
  })

  it('calls the event handler with right details when a new blog is created', async () => {
    render(
      <BlogForm
        setMsg={mockSetMsg}
        setMsgStatus={mockSetMsgStatus}
        blogs={mockBlogs}
        setBlogs={mockSetBlogs}
      />
    )

    // Find the form inputs
    const titleInput = screen.getByLabelText('title')
    const authorInput = screen.getByLabelText('author')
    const urlInput = screen.getByLabelText('url')
    const createButton = screen.getByText('create')

    // Fill in the form fields
    act(() => {
      fireEvent.change(titleInput, { target: { value: 'Test Blog Title' } })
      fireEvent.change(authorInput, { target: { value: 'Test Author' } })
      fireEvent.change(urlInput, { target: { value: 'https://testblog.com' } })
    })

    // Submit the form
    act(() => {
      fireEvent.click(createButton)
    })

    // Verify that blogService.create was called with the right details
    expect(blogService.create).toHaveBeenCalledWith({
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'https://testblog.com'
    })

    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify that setBlogs was called with the updated blogs list
    expect(mockSetBlogs).toHaveBeenCalledWith([
      {
        id: 'new-blog-id',
        title: 'Test Blog',
        author: 'Test Author',
        url: 'https://testblog.com',
        likes: 0
      }
    ])

    // Verify that success message was set
    expect(mockSetMsg).toHaveBeenCalledWith('a new blog Test Blog Title by Test Author added')
    expect(mockSetMsgStatus).toHaveBeenCalledWith('success')
  })

  it('shows error message when blog creation fails', async () => {
    // Mock blogService.create to throw an error
    blogService.create = vi.fn().mockRejectedValue(new Error('Failed to create blog'))

    render(
      <BlogForm
        setMsg={mockSetMsg}
        setMsgStatus={mockSetMsgStatus}
        blogs={mockBlogs}
        setBlogs={mockSetBlogs}
      />
    )

    // Fill in the form fields
    const titleInput = screen.getByLabelText('title')
    const authorInput = screen.getByLabelText('author')
    const urlInput = screen.getByLabelText('url')
    const createButton = screen.getByText('create')

    act(() => {
      fireEvent.change(titleInput, { target: { value: 'Test Blog' } })
      fireEvent.change(authorInput, { target: { value: 'Test Author' } })
      fireEvent.change(urlInput, { target: { value: 'https://testblog.com' } })
    })

    // Submit the form
    act(() => {
      fireEvent.click(createButton)
    })

    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify that error message was set
    expect(mockSetMsg).toHaveBeenCalledWith('error creating a new blog')
    expect(mockSetMsgStatus).toHaveBeenCalledWith('error')
  })
})
