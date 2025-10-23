const { test, expect } = require('@playwright/test');

test.describe('Login functionality', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')

    // Create a new user for tests
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'testpass'
      }
    });

    // Clear local storage before each test to ensure clean state
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
    });
  });

  test('displays login form by default', async ({ page }) => {
    // Check that the login heading is visible
    await expect(page.locator('h2:has-text("log in to application")')).toBeVisible();

    // Check that the login form is visible
    await expect(page.locator('form')).toBeVisible();

    // Check for username input field with label
    await expect(page.locator('label:has-text("username")')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();

    // Check for password input field with label
    await expect(page.locator('label:has-text("password")')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Check for login button
    await expect(page.locator('button[type="submit"]:has-text("login")')).toBeVisible();

    // Verify that blog content is not visible when not logged in
    await expect(page.locator('h2:has-text("blogs")')).not.toBeVisible();
  });

  test('failed login with wrong credentials', async ({ page }) => {
    // Fill in login form with wrong credentials
    await page.locator('input[type="text"]').fill('wronguser');
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Click login button
    await page.locator('button[type="submit"]:has-text("login")').click();

    // Wait a moment for the API call to complete
    await page.waitForTimeout(1000);

    // Verify login form is still visible (login failed)
    await expect(page.locator('h2:has-text("log in to application")')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();

    // Verify blogs section is not visible (still not logged in)
    await expect(page.locator('h2:has-text("blogs")')).not.toBeVisible();
  });

  test('login form inputs work correctly', async ({ page }) => {
    // Get the input elements
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');

    // Test typing in username field
    await usernameInput.fill('testuser');
    await expect(usernameInput).toHaveValue('testuser');

    // Test typing in password field
    await passwordInput.fill('testpass');
    await expect(passwordInput).toHaveValue('testpass');

    // Verify we can clear fields
    await usernameInput.fill('');
    await passwordInput.fill('');
    await expect(usernameInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('simulates successful login by mocking localStorage', async ({ page }) => {
    // Mock a successful login by setting localStorage before navigation
    await page.addInitScript(() => {
      const mockUser = {
        username: 'testuser',
        name: 'Test User',
        token: 'mock-jwt-token'
      };
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(mockUser));
    });

    // Navigate to the page with the mocked localStorage already set
    await page.goto('/');

    // Wait a short moment for React to render
    await page.waitForTimeout(500);

    // Verify that blogs heading is visible (user is logged in)
    await expect(page.locator('h2:has-text("blogs")')).toBeVisible();

    // Verify login form is no longer visible
    await expect(page.locator('h2:has-text("log in to application")')).not.toBeVisible();

    // Verify user info is displayed
    await expect(page.locator('text=Test User logged in')).toBeVisible();
    await expect(page.locator('button:has-text("logout")')).toBeVisible();

    // Verify create new blog section is visible
    await expect(page.locator('h2:has-text("create new")')).toBeVisible();
  });

  test('logout functionality works', async ({ page }) => {
    // Mock a logged-in user before navigation
    await page.addInitScript(() => {
      const mockUser = {
        username: 'testuser',
        name: 'Test User',
        token: 'mock-jwt-token'
      };
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(mockUser));
    });

    // Navigate to the page with the mocked localStorage already set
    await page.goto('/');

    // Wait a short moment for React to render
    await page.waitForTimeout(500);

    // Verify user is logged in
    await expect(page.locator('text=Test User logged in')).toBeVisible();

    // Click logout button
    await page.locator('button:has-text("logout")').click();

    // Wait a moment for logout to process
    await page.waitForTimeout(200);

    // Verify login form is shown again
    await expect(page.locator('h2:has-text("log in to application")')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();

    // Verify blogs section is no longer visible
    await expect(page.locator('h2:has-text("blogs")')).not.toBeVisible();
  });

  test('logged in user can create a blog', async ({ page }) => {
    // login
    await page.locator('label:has-text("username") input').fill('testuser');
    await page.locator('label:has-text("password") input').fill('testpass');
    await page.locator('button[type="submit"]:has-text("login")').click();

    // Wait for successful login - check that user info appears
    await expect(page.locator('text=Test User logged in')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("blogs")')).toBeVisible();

    // Verify user is logged in and create new blog section is visible
    const createNewBlogButton = page.locator('button:has-text("create new blog")')
    await expect(createNewBlogButton).toBeVisible();
    await createNewBlogButton.click();

    // Fill in the blog creation form
    await page.locator('label:has-text("title") input').fill('Test Blog Title');
    await page.locator('label:has-text("author") input').fill('Test Author');
    await page.locator('label:has-text("url") input').fill('https://testblog.com');

    // Click the create button
    await page.locator('button[type="submit"]:has-text("create")').click();

    // Wait for the blog to be created
    await page.waitForTimeout(1000);

    // Verify the blog appears in the blogs list
    await expect(page.locator('div:has-text("Test Blog Title Test Author")').first()).toBeVisible();

    // Verify the blog details are visible when expanded
    await page.locator('button:has-text("view")').first().click();
    await expect(page.locator('text=https://testblog.com')).toBeVisible();
    await expect(page.locator('text=0').first()).toBeVisible();
  });

  test('logged in user can like a blog', async ({ page }) => {
    // login
    await page.locator('label:has-text("username") input').fill('testuser');
    await page.locator('label:has-text("password") input').fill('testpass');
    await page.locator('button[type="submit"]:has-text("login")').click();

    // Wait for successful login - check that user info appears
    await expect(page.locator('text=Test User logged in')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("blogs")')).toBeVisible();

    // Verify user is logged in and create new blog section is visible
    const createNewBlogButton = page.locator('button:has-text("create new blog")')
    await expect(createNewBlogButton).toBeVisible();
    await createNewBlogButton.click();

    // Create a test blog to like
    await page.locator('label:has-text("title") input').fill('Test Blog for Liking');
    await page.locator('label:has-text("author") input').fill('Test Author');
    await page.locator('label:has-text("url") input').fill('https://testblog.com');

    // Click the create button
    await page.locator('button[type="submit"]:has-text("create")').click();

    // Wait for the blog to be created
    await page.waitForTimeout(1000);

    // Verify the blog appears in the blogs list
    await expect(page.locator('div:has-text("Test Blog for Liking Test Author")').first()).toBeVisible();

    // Click the view button to expand blog details
    await page.locator('button:has-text("view")').first().click();

    // Wait for the details to be visible
    await page.waitForTimeout(500);

    // Verify initial likes count is 0
    await expect(page.locator('text=0').first()).toBeVisible();

    // Click the like button
    await page.locator('button:has-text("like")').first().click();

    // Wait for the like to be processed and verify the likes count has increased to 1
    await expect(page.locator('text=1').first()).toBeVisible({ timeout: 5000 });

    // Click the like button again
    await page.locator('button:has-text("like")').first().click();

    // Wait for the like to be processed and verify the likes count has increased to 2
    await expect(page.locator('text=2').first()).toBeVisible({ timeout: 5000 });
  });

  test('user who created a blog can delete the blog', async ({ page }) => {
    // login
    await page.locator('label:has-text("username") input').fill('testuser');
    await page.locator('label:has-text("password") input').fill('testpass');
    await page.locator('button[type="submit"]:has-text("login")').click();

    // Wait for successful login - check that user info appears
    await expect(page.locator('text=Test User logged in')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("blogs")')).toBeVisible();

    // Verify user is logged in and create new blog section is visible
    const createNewBlogButton = page.locator('button:has-text("create new blog")')
    await expect(createNewBlogButton).toBeVisible();
    await createNewBlogButton.click();

    // Create a test blog to delete
    await page.locator('label:has-text("title") input').fill('Test Blog to Delete');
    await page.locator('label:has-text("author") input').fill('Test Author');
    await page.locator('label:has-text("url") input').fill('https://testblog.com');

    // Click the create button
    await page.locator('button[type="submit"]:has-text("create")').click();

    // Wait for the blog to be created
    await page.waitForTimeout(1000);

    // Verify the blog appears in the blogs list
    await expect(page.locator('div:has-text("Test Blog to Delete Test Author")').first()).toBeVisible();

    // Click the view button to expand blog details
    await page.locator('button:has-text("view")').first().click();

    // Wait for the details to be visible
    await page.waitForTimeout(500);

    // Wait for the blog data to be properly loaded with user information
    // Give more time for the user data to be populated and compared
    await page.waitForTimeout(2000);

    // and verify the remove button is visible (only for the blog creator)
    await expect(page.locator('button:has-text("remove")').first()).toBeVisible({ timeout: 10000 });

    // Click the remove button
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Remove blog Test Blog to Delete by Test Author?');
      dialog.accept();
    });
    await page.locator('button:has-text("remove")').first().click();

    // Wait for the blog to be removed
    await page.waitForTimeout(1000);

    // Verify the blog is no longer visible in the blogs list
    await expect(page.locator('div:has-text("Test Blog to Delete Test Author")')).not.toBeVisible();
  });

  test('only blog creator can see remove button', async ({ page, request }) => {
    // Reset and create two users
    await request.post('/api/testing/reset');

    // Create first user
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'testpass'
      }
    });

    // Create second user
    await request.post('/api/users', {
      data: {
        name: 'Another User',
        username: 'anotheruser',
        password: 'anotherpass'
      }
    });

    // Login as first user and create a blog
    await page.goto('/');
    await page.locator('input[type="text"]').fill('testuser');
    await page.locator('input[type="password"]').fill('testpass');
    await page.locator('button[type="submit"]:has-text("login")').click();

    await expect(page.locator('text=Test User logged in')).toBeVisible({ timeout: 5000 });

    // Create a blog as first user
    const createNewBlogButton = page.locator('button:has-text("create new blog")');
    await createNewBlogButton.click();

    await page.locator('label:has-text("title") input').fill('Blog by First User');
    await page.locator('label:has-text("author") input').fill('First Author');
    await page.locator('label:has-text("url") input').fill('https://firstblog.com');
    await page.locator('button[type="submit"]:has-text("create")').click();

    await page.waitForTimeout(1000);

    // Expand the blog details to see the remove button
    await page.locator('button:has-text("view")').first().click();
    await page.waitForTimeout(2000);

    // Verify the creator can see the delete button
    await expect(page.locator('button:has-text("remove")').first()).toBeVisible({ timeout: 5000 });

    // Logout as first user
    await page.locator('button:has-text("logout")').click();
    await page.waitForTimeout(500);

    // Login as second user
    await page.locator('input[type="text"]').fill('anotheruser');
    await page.locator('input[type="password"]').fill('anotherpass');
    await page.locator('button[type="submit"]:has-text("login")').click();

    await expect(page.locator('text=Another User logged in')).toBeVisible({ timeout: 5000 });

    // Expand the blog details
    await page.locator('button:has-text("view")').first().click();
    await page.waitForTimeout(1000);

    // Verify the second user CANNOT see the delete button
    await expect(page.locator('button:has-text("remove")')).not.toBeVisible();
  });

  test('blogs are arranged in order according to likes', async ({ page, request }) => {
    // Login
    await page.locator('input[type="text"]').fill('testuser');
    await page.locator('input[type="password"]').fill('testpass');
    await page.locator('button[type="submit"]:has-text("login")').click();

    await page.waitForTimeout(1000);
    await expect(page.locator('text=Test User logged in')).toBeVisible({ timeout: 2000 });

    // Create first blog
    const createNewBlogButton = page.locator('button:has-text("create new blog")');
    await createNewBlogButton.click();

    await page.locator('label:has-text("title") input').fill('Blog with Most Likes');
    await page.locator('label:has-text("author") input').fill('Author One');
    await page.locator('label:has-text("url") input').fill('https://most-likes.com');
    await page.locator('button[type="submit"]:has-text("create")').click();

    await page.waitForTimeout(2000);

    // Create second blog
    await page.locator('label:has-text("title") input').fill('Blog with Some Likes');
    await page.locator('label:has-text("author") input').fill('Author Two');
    await page.locator('label:has-text("url") input').fill('https://some-likes.com');
    await page.locator('button[type="submit"]:has-text("create")').click();

    await page.waitForTimeout(2000);

    // Create third blog
    await page.locator('label:has-text("title") input').fill('Blog with Few Likes');
    await page.locator('label:has-text("author") input').fill('Author Three');
    await page.locator('label:has-text("url") input').fill('https://few-likes.com');
    await page.locator('button[type="submit"]:has-text("create")').click();

    await page.waitForTimeout(2000);

    // Expand all blog details
    await page.locator('button:has-text("view")').nth(0).click();
    await page.waitForTimeout(800);
    await page.locator('button:has-text("view")').nth(1).click();
    await page.waitForTimeout(800);
    await page.locator('button:has-text("view")').nth(2).click();
    await page.waitForTimeout(800);

    // All blogs start with 0 likes, they should be in creation order initially
    // Now let's like the second blog multiple times to make it have the most likes
    // Find the "Blog with Some Likes" and like it 3 times
    await page.getByRole('button', { name: 'like' }).first().click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'like' }).first().click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'like' }).first().click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'like' }).nth(1).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'like' }).nth(1).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'like' }).nth(2).click();
    await page.waitForTimeout(1000);

    // // Get all blog entries in their current order
    // const blogEntries = await page.locator('div').filter({ hasText: /^Blog with/ }).all();

    // console.log('The length of blogEntries:', blogEntries.length);

    // await expect(blogEntries[0]).toContainText('Blog with Most Likes');
    // await expect(blogEntries[1]).toContainText('Blog with Some Likes');
    // await expect(blogEntries[2]).toContainText('Blog with Few Likes');

    const blogSelector = '.blog-post';
    const blogs = page.locator(blogSelector);
    await expect(blogs.nth(0)).toContainText('Blog with Most Likes');
    await expect(blogs.nth(1)).toContainText('Blog with Some Likes');
    await expect(blogs.nth(2)).toContainText('Blog with Few Likes');
  });
});
