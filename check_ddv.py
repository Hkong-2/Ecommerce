from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("https://didongviet.vn/dien-thoai/samsung-galaxy-s26-512gb.html", timeout=30000)

            # Wait for main product container
            page.wait_for_load_state("networkidle")

            # Look for color options
            color_elements = page.query_selector_all(".product-detail-color-item, [class*='color'], [class*='attribute']")

            print(f"Found {len(color_elements)} potential color/attribute elements.")

            for el in color_elements[:10]:
                print("- Element text:", el.inner_text().strip().replace('\n', ' '))

            # Look for gallery images
            gallery_images = page.query_selector_all(".product-gallery img, .swiper-wrapper img, .image-gallery img")
            print(f"\nFound {len(gallery_images)} potential gallery images.")
            for img in gallery_images[:5]:
                print("- Image src:", img.get_attribute("src"))

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
