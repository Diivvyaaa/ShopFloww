package com.shopflow.config;

import com.shopflow.model.Product;
import com.shopflow.model.User;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository    users;
    private final ProductRepository products;
    private final PasswordEncoder   encoder;

    public DataSeeder(UserRepository users, ProductRepository products, PasswordEncoder encoder) {
        this.users    = users;
        this.products = products;
        this.encoder  = encoder;
    }

    @Override
    public void run(String... args) {

        // ── Seed users only if table is empty ─────────────────────────────────
      if (users.count() == 0) {
    User admin = new User();
    admin.setName("Admin");
    admin.setEmail("admin@shopflow.com");
    admin.setPassword(encoder.encode("admin123"));
    admin.setRole("admin");
    admin.setCustomerId(null);
    users.save(admin);
    System.out.println("✅ Admin seeded.");
}

        // ── Seed products only if table is empty ──────────────────────────────
        if (products.count() == 0) {

            String[][] items = {
                { "Air Max Pro",  "Footwear",    "129", "43",  "👟", "Premium running shoes with advanced cushioning."     },
                { "Canvas Tote",  "Bags",        "49",  "120", "👜", "Spacious and stylish everyday carry bag."            },
                { "Silk Scarf",   "Accessories", "89",  "18",  "🧣", "Luxurious 100% silk scarf in vibrant patterns."      },
                { "Watch Strap",  "Accessories", "35",  "75",  "⌚", "Genuine leather strap, fits most sizes."             },
                { "Leather Belt", "Accessories", "65",  "52",  "👔", "Classic full-grain leather belt with brass buckle."  },
                { "Sunglasses",   "Eyewear",     "112", "29",  "🕶️", "UV400 polarized lenses in a timeless frame."        },
            };

            for (String[] item : items) {
                Product p = new Product();
                p.setName(item[0]);
                p.setCategory(item[1]);
                p.setPrice(Double.parseDouble(item[2]));
                p.setStock(Integer.parseInt(item[3]));
                p.setEmoji(item[4]);
                p.setDescription(item[5]);
                products.save(p);
            }

            System.out.println("✅ Products seeded.");
        }
    }
}
