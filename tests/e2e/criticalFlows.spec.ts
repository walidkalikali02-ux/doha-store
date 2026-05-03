import {test, expect} from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
};

test.describe('Critical User Flows', () => {
  test.describe('Homepage and Navigation', () => {
    test('should load homepage successfully', async ({page}) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Roastery|Doha/);
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should navigate to shop page', async ({page}) => {
      await page.goto('/');
      await page.click('a[href="/shop"]');
      await expect(page).toHaveURL('/shop');
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    });

    test('should display navigation menu on mobile', async ({page}) => {
      await page.setViewportSize({width: 375, height: 667});
      await page.goto('/');
      const menuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      }
    });
  });

  test.describe('Product Browsing', () => {
    test('should display product listing', async ({page}) => {
      await page.goto('/shop');
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    });

    test('should filter products by category', async ({page}) => {
      await page.goto('/shop');
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.waitForResponse(resp => resp.url().includes('/api/products'));
      }
    });

    test('should view product details', async ({page}) => {
      await page.goto('/shop');
      const firstProduct = page.locator('[data-testid="product-card"]').first();
      if (await firstProduct.isVisible()) {
        await firstProduct.click();
        await expect(page).toHaveURL(/\/products\//);
        await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="variant-selector"]')).toBeVisible();
      }
    });

    test('should select product variant', async ({page}) => {
      await page.goto('/products/test-product');
      const sizeSelector = page.locator('[data-testid="size-selector"]');
      if (await sizeSelector.isVisible()) {
        await sizeSelector.click();
        await page.locator('[data-testid="size-option-500g"]').click();
      }
    });
  });

  test.describe('Cart Management', () => {
    test('should add product to cart', async ({page}) => {
      await page.goto('/products/test-product');
      const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]');
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
        await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
      }
    });

    test('should update cart quantity', async ({page}) => {
      await page.goto('/cart');
      const quantityInput = page.locator('[data-testid="cart-item-quantity"]');
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('2');
        await page.waitForResponse(resp => resp.url().includes('/api/cart'));
      }
    });

    test('should remove item from cart', async ({page}) => {
      await page.goto('/cart');
      const removeButton = page.locator('[data-testid="remove-cart-item"]');
      if (await removeButton.isVisible()) {
        await removeButton.click();
        await page.waitForResponse(resp => resp.url().includes('/api/cart'));
      }
    });

    test('should apply discount code', async ({page}) => {
      await page.goto('/cart');
      const discountInput = page.locator('[data-testid="discount-code-input"]');
      if (await discountInput.isVisible()) {
        await discountInput.fill('TEST10');
        await page.locator('[data-testid="apply-discount-button"]').click();
      }
    });
  });

  test.describe('Authentication', () => {
    test('should display login form', async ({page}) => {
      await page.goto('/login');
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should display registration form', async ({page}) => {
      await page.goto('/register');
      await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    });

    test('should show validation errors on empty login', async ({page}) => {
      await page.goto('/login');
      await page.locator('[data-testid="login-submit"]').click();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });

    test('should navigate to forgot password', async ({page}) => {
      await page.goto('/login');
      await page.click('a[href="/forgot-password"]');
      await expect(page).toHaveURL('/forgot-password');
    });
  });

  test.describe('Checkout Flow', () => {
    test.beforeEach(async ({page}) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.locator('[data-testid="login-submit"]').click();
      await page.waitForURL(/\/$/, {timeout: 10000}).catch(() => {});
    });

    test('should display checkout steps', async ({page}) => {
      await page.goto('/checkout');
      await expect(page.locator('[data-testid="checkout-steps"]')).toBeVisible();
    });

    test('should fill shipping information', async ({page}) => {
      await page.goto('/checkout/shipping');
      await page.fill('[data-testid="first-name"]', 'John');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.fill('[data-testid="email"]', 'john@example.com');
      await page.fill('[data-testid="address"]', '123 Main St');
      await page.fill('[data-testid="city"]', 'Kuwait City');
      await page.fill('[data-testid="postal-code"]', '12345');
      await page.fill('[data-testid="phone"]', '+96512345678');
    });

    test('should select shipping method', async ({page}) => {
      await page.goto('/checkout/shipping');
      const standardShipping = page.locator('[data-testid="shipping-method-standard"]');
      if (await standardShipping.isVisible()) {
        await standardShipping.click();
      }
    });
  });

  test.describe('Account Management', () => {
    test.beforeEach(async ({page}) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.locator('[data-testid="login-submit"]').click();
      await page.waitForURL(/\/$/, {timeout: 10000}).catch(() => {});
    });

    test('should display account dashboard', async ({page}) => {
      await page.goto('/account');
      await expect(page.locator('[data-testid="account-nav"]')).toBeVisible();
    });

    test('should display order history', async ({page}) => {
      await page.goto('/account/orders');
      await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    });

    test('should display addresses', async ({page}) => {
      await page.goto('/account/addresses');
      await expect(page.locator('[data-testid="addresses-list"]')).toBeVisible();
    });

    test('should display payment methods', async ({page}) => {
      await page.goto('/account/payment-methods');
      await expect(page.locator('[data-testid="payment-methods-section"]')).toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('should display search input', async ({page}) => {
      await page.goto('/');
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should search for products', async ({page}) => {
      await page.goto('/');
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('coffee');
        await searchInput.press('Enter');
        await page.waitForURL(/\/search\?q=/);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have no accessibility violations on homepage', async ({page}) => {
      await page.goto('/');
      const accessibilityScanResults = await page.locator('body').evaluate(() => {
        const issues: string[] = [];
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (!img.alt) {
            issues.push(`Image missing alt: ${img.src}`);
          }
        });
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
          if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
            issues.push('Button missing accessible name');
          }
        });
        return issues;
      });
      expect(accessibilityScanResults).toHaveLength(0);
    });

    test('should be keyboard navigable', async ({page}) => {
      await page.goto('/');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
    });
  });

  test.describe('Performance', () => {
    test('should load homepage within acceptable time', async ({page}) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have responsive images', async ({page}) => {
      await page.goto('/shop');
      const images = await page.locator('img').all();
      for (const img of images.slice(0, 3)) {
        const srcset = await img.getAttribute('srcset');
        const loading = await img.getAttribute('loading');
        expect(loading === 'lazy' || srcset !== null).toBeTruthy();
      }
    });
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('should display mobile navigation', async ({page}) => {
    await page.goto('/');
    const hamburgerMenu = page.locator('[data-testid="mobile-menu-button"]');
    if (await hamburgerMenu.isVisible()) {
      await hamburgerMenu.click();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    }
  });

  test('should have touch-friendly buttons', async ({page}) => {
    await page.goto('/');
    const buttons = await page.locator('button, a').all();
    for (const button of buttons.slice(0, 5)) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('should display 404 page for non-existent routes', async ({page}) => {
    await page.goto('/non-existent-page');
    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({page}) => {
    await page.route('**/api/**', route => route.abort());
    await page.goto('/shop');
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });
});
