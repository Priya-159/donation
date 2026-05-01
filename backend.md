# ⚙️ Django Backend Internal Flow Explanation (Viva Guide)

Yeh document aapke Django REST Framework (DRF) backend ki in-depth working samjhata hai. Isko simple Hinglish me likha gaya hai taaki viva me questions ka answer dena easy ho.

---

## 1. Project Structure (Folder Layout)

Aapka backend Django framework pe bana hai. Isme ek main project folder hai aur chote chote "apps" hain:

- **`ecolink_backend/`**: Yeh main project folder hai jahan configuration hoti hai.
  - `settings.py`: Yahan database, installed apps, aur JWT ki configuration hai.
  - `urls.py`: Yeh master entry point hai jahan se saari requests ko alag alag apps me redirect kiya jata hai.
- **`users/` App**: Authentication, profiles, aur Volunteer applications handle karta hai.
- **`donations/` App**: Donations ka data aur pickup locations handle karta hai.
- **`inventory/` App**: Completed donations ka final record rakhta hai.
- **`chat/` App**: Notifications handle karta hai.

Har app me yeh files common hain:
- **`models.py`**: Database ka structure (tables) define karta hai.
- **`serializers.py`**: Database object ko JSON me (aur JSON ko Python data me) convert karta hai.
- **`views.py`**: Actual business logic likhi hoti hai (Request leke Response dena).
- **`urls.py`**: App-level routing.

---

## 2. Request-Response Flow (Internal Flow)

Jab frontend (React) se request aati hai, to yeh step-by-step flow hota hai:

```text
[Frontend Request] 
      ↓
(1) Middleware (CORS & Security check)
      ↓
(2) ecolink_backend/urls.py (Master Router)
      ↓
(3) donations/urls.py (App Router)
      ↓
(4) views.py (Permissions check, Token check)
      ↓
(5) serializers.py (JSON to Python validation)
      ↓
(6) models.py / ORM (Database query - Save/Get)
      ↓
[PostgreSQL Database] (Data return)
      ↓
(7) serializers.py (Python to JSON conversion)
      ↓
(8) views.py (Generate HTTP Response)
      ↓
[Frontend Response (JSON)]
```

---

## 3. URL Routing (Path Mapping)

- Frontend sabse pehle `ecolink_backend/urls.py` hit karta hai.
- Wahan likha hai: `path('api/donations/', include('donations.urls'))`
- Iska matlab: "Agar URL api/donations/ se shuru hota hai, to usko donations app ke urls.py me bhej do."
- Phir `donations/urls.py` usko specific View function se map karta hai.

---

## 4. Views Analysis (Core Logic Functions)

Django me aapne dono **Class-Based Views (CBVs)** aur **ViewSets** use kiye hain. Kuch major views:

### A. `DonationViewSet` (`donations/views.py`)
- **Type:** `ModelViewSet` (Is ek class me saare CRUD operations auto-generate ho jate hain: GET, POST, PUT, DELETE).
- **Logic:** 
  - `get_queryset()` check karta hai ki user kon hai. Agar Admin hai to saari donations return karta hai. Agar regular user hai to sirf uski apni donations return karta hai.
  - `@action(detail=False) public_stats`: Yeh custom function dashboard ke stats (Total donations, meals provided) nikalta hai.
- **Input:** JSON payload (donation details).
- **Output:** Serialized JSON response (200 OK ya 201 Created).

### B. `RegisterView` (`users/views.py`)
- **Type:** `generics.CreateAPIView`
- **Logic:** Naya user create karta hai. `AllowAny` permission lagai hai taaki bina login ke bhi hit ho sake.

### C. `VolunteerApplicationView` (`users/views.py`)
- **Type:** `APIView`
- **Logic:** User ke application form ko save karta hai aur `request.user` ko automatically link kar deta hai.

---

## 5. Models (Database Architecture)

Aapke ORM models hi backend ka core hain:

- **`User` (AbstractUser):** Django ke default user model ko customize karke `role` (Admin/Volunteer/Donor), `phone_number`, aur `city` add kiya gaya hai.
- **`Donation`:** Fields jaise `category`, `quantity`, `status`. Ek zaroori relation hai:
  - `donor = models.ForeignKey(User)`: Ek user kitni bhi donations kar sakta hai (1-to-Many).
- **`PickupDetails`:** 
  - `donation = models.OneToOneField(Donation)`: Har donation ki sirf ek pickup detail hogi (1-to-1).
  - `volunteer = models.ForeignKey(User)`: Kis volunteer ne pickup uthaya hai.

**Smart Model Logic:** `Donation` model ke andar `save()` method ko override kiya gaya hai. Jab admin status ko "Completed" karta hai, tab automatic `inventory` update ho jati hai.

---

## 6. Database Flow (Django ORM)

Django me direct SQL queries (SELECT * FROM) nahi likhi jati. ORM (Object-Relational Mapping) use hoti hai.

- **Create:** `Notification.objects.create(user=admin, title="...")`
- **Read:** `Donation.objects.filter(donor=user)`
- **Update:** `pickup.volunteer_id = volunteer_id; pickup.save()`
- **Aggregation:** `Donation.objects.filter(category='Monetary').aggregate(total=Sum('quantity'))` (Total fund calculate karne ke liye).

---

## 7. API Layer (Django REST Framework - DRF)

DRF frontend aur backend ke beech bridge ka kaam karta hai:
- **Serializers (`serializers.py`):** Inka kaam validation karna aur data translate karna hai. Jab frontend "quantity" aur "category" bhejta hai, to `DonationSerializer` check karta hai ki data format theek hai ya nahi. Agar galat hai, to direct `400 Bad Request` bhej deta hai database touch kiye bina.

---

## 8. Frontend-Backend Interaction

- **Request:** React frontend form bhar ke `POST /api/donations/` par call karta hai. Saath me JWT Token bhejta hai Header me.
- **Backend Validation:** View check karta hai token valid hai ya nahi (`IsAuthenticated` permission).
- **Creation:** Django data ko DB me dalta hai aur ussi naye object ko JSON banake wapas bhejta hai.
- **Frontend Update:** React us JSON ko padh kar user ko Success Popup dikhata hai.

---

## 9. Middleware

`settings.py` me MIDDLEWARE list hai jo har request par execute hoti hai.
- `CorsMiddleware`: Frontend (localhost:5173) ko Backend (localhost:8000) se baat karne ki permission deta hai (Cross-Origin Resource Sharing).
- `AuthenticationMiddleware`: Har request par check karta hai ki user ka session kya hai aur `request.user` set karta hai.

---

## 10. Authentication & Authorization

Aapne **JWT (JSON Web Tokens)** use kiya hai (`rest_framework_simplejwt`).
- Jab user login karta hai, to usko 2 keys milti hain: **Access Token** (24 hours expiry) aur **Refresh Token** (7 days expiry).
- API call karte time Access Token Header me bheja jata hai `Authorization: Bearer <token>`.
- Views me `permission_classes = [IsAuthenticated]` ensure karta hai ki koi anonymous hacker protected routes access na kar paye. `IsAdminUser` class sirf Admin permissions check karti hai.

---

## 11. Error Handling

- Status Codes automatically handle hote hain:
  - **200 OK**: Request successful aur data wapas.
  - **201 Created**: Nayi entry successfully ban gayi.
  - **400 Bad Request**: Form me galat data aaya (e.g. email ki jagah number daal diya). DRF automatic JSON error bhejta hai: `{"email": ["Enter a valid email address."]}`.
  - **401 Unauthorized**: Token expire ho gaya ya bheja hi nahi.
  - **403 Forbidden**: Aap authenticated to hain par us action ki permission nahi hai (jaise ek donor Admin pane kholne ki koshish kare).

---

## 12. Full Flow Summary (Viva ke liye Perfect Answer)

*"Sir/Ma'am, jab user frontend se Donate button dabata hai, ek POST request banti hai jo JWT token ke sath hamare Django server ke `urls.py` par hit karti hai. URL matching ke baad request `DonationViewSet` me jati hai. Wahan DRF permissions verify karta hai aur request data ko `DonationSerializer` me pass karta hai. Serializer validation karta hai aur data ko `Donation` Model ke through PostgreSQL database me save kar deta hai. Hamne Django Signals use kiye hain, to data save hote hi automatic background me admin ko Notification chala jata hai. Finally, naya database object JSON me convert hoke 201 Created status ke sath frontend ko wapas chala jata hai jisse UI update ho jati hai."*

---

## 13. Optimization & Advanced Logic Used

1. **Signals (`post_save`):** Aapne `users/models.py` aur `donations/models.py` me `@receiver(post_save)` use kiya hai. Is se hota yeh hai ki jab bhi DB me entry aati hai, notification automatically ban jata hai bina view ke logic ko complex kiye.
2. **Database Indexing:** `Donation` model me `indexes = [models.Index(fields=['status'])]` define kiya gaya hai. Iska faida yeh hai ki jab admin panel me donations "status" se filter hoti hain, to PostgreSQL query bohot fast execute hoti hai.
3. **Cloudinary Integration:** Images local server pe save karne ki jagah seedha Cloudinary CDN par upload ho rahi hain `models.ImageField(upload_to='donations/')` ke through, jis se server ki space bachti hai aur image load time fast hota hai.
