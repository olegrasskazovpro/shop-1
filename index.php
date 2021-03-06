<?php
$h2 = 'THE BRAND';
$h4 = 'OF LUXERIOUS <span>FASHION</span>';
$title = 'B-shop';
$year = date('Y');
?>
<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?php echo $title?></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/font-awesome-4.7.0/css/font-awesome.min.css">
</head>
<body>
<header class="header">
    <div class="container header-flex">
        <div class="header-left">
            <a href="index.html" class="link-logo">
                <img src="img/logo.png" alt="logo">BRAN<span>D</span>
            </a>
            <div class="browse">
                <a href="#">Browse<i class="fa fa-caret-down"></i></a>
                <div class="drop-down">
                    <div class="drop-down-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                            <li><a href="product.html">Blazers</a></li>
                            <li><a href="product.html">Denim</a></li>
                            <li><a href="product.html">Leggings/Pants</a></li>
                            <li><a href="product.html">Skirts/Shorts</a></li>
                            <li><a href="product.html">Accessories</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>MEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Tees/Tank tops</a></li>
                            <li><a href="product.html">Shirts/Polos</a></li>
                            <li><a href="product.html">Sweaters</a></li>
                            <li><a href="product.html">Sweatshirts/Hoodies</a></li>
                            <li><a href="product.html">Blazers</a></li>
                            <li><a href="product.html">Jackets/vests</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <form action="#">
                <input type="text" placeholder="Search for Item...">
                <button type="submit"><i class="fa fa-search"></i></button>
            </form>
        </div>
        <div class="header-right">
            <div class="cart-header">
                <a href="cart.html"><img src="img/cart(1).svg" alt="cart"></a>
                <div class="triangle"></div>
                <div class="drop-down">
                    <div class="cart-added">
                        <a href="single.html"><img src="img/cart-img-1.jpg" alt="Rebox Zane"></a>
                        <div class="desc">
                            <a href="single.html">Rebox Zane</a>
                            <div class="stars">
                                <img src="img/star.svg" alt="">
                                <img src="img/star.svg" alt="">
                                <img src="img/star.svg" alt="">
                                <img src="img/star.svg" alt="">
                                <img src="img/star.svg" alt="">
                                <div class="rate"></div>
                            </div>
                            <span>1 x $250</span>
                        </div>
                        <button><i class="fa fa-times-circle"></i></button>
                    </div>
                    <div class="cart-added">
                        <a href="single.html"><img src="img/cart-img-2.jpg" alt="Rebox Zane"></a>
                        <div class="desc">
                            <a href="single.html">Rebox Zane</a>
                            <div class="stars">
                                <img src="img/star.svg" alt="">
                                <img src="img/star.svg" alt="">
                                <img src="img/star.svg" alt="">
                                <img src="img/star.svg" alt="">
                                <img src="img/star.svg" alt="">
                                <div class="rate"></div>
                            </div>
                            <span>1 x $250</span>
                        </div>
                        <button><i class="fa fa-times-circle"></i></button>
                    </div>
                    <div class="total">
                        <p>TOTAL</p>
                        <p>$500.00</p>
                    </div>
                    <a href="checkout.html" class="button">Checkout</a>
                    <a href="cart.html" class="button">Go to cart</a>
                </div>
            </div>
            <a href="#" class="my-acc-btn">My Account<i class="fa fa-caret-down"></i></a>
        </div>
    </div>
</header>
<div class="content">
    <nav class="container">
        <ul class="menu">
            <li><a href="index.html" class="menu-active">Home</a></li>
            <li><a href="product.html">Man</a>
                <div class="triangle"></div>
                <div class="mega">
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                            <li><a href="product.html">Blazers</a></li>
                            <li><a href="product.html">Denim</a></li>
                            <li><a href="product.html">Leggings/Pants</a></li>
                            <li><a href="product.html">Skirts/Shorts</a></li>
                            <li><a href="product.html">Accessories</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <a href="single.html">
                            <p>SUPER<br>SALE!</p>
                        </a>
                    </div>
                </div>
            </li>
            <li><a href="product.html">Women</a>
                <div class="triangle"></div>
                <div class="mega">
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                            <li><a href="product.html">Blazers</a></li>
                            <li><a href="product.html">Denim</a></li>
                            <li><a href="product.html">Leggings/Pants</a></li>
                            <li><a href="product.html">Skirts/Shorts</a></li>
                            <li><a href="product.html">Accessories</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <a href="single.html">
                            <p>SUPER<br>SALE!</p>
                        </a>
                    </div>
                </div>
            </li>
            <li><a href="product.html">Accessories</a>
                <div class="triangle"></div>
                <div class="mega">
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                            <li><a href="product.html">Blazers</a></li>
                            <li><a href="product.html">Denim</a></li>
                            <li><a href="product.html">Leggings/Pants</a></li>
                            <li><a href="product.html">Skirts/Shorts</a></li>
                            <li><a href="product.html">Accessories</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <a href="single.html">
                            <p>SUPER<br>SALE!</p>
                        </a>
                    </div>
                </div>
            </li>
            <li><a href="product.html">Featured</a>
                <div class="triangle"></div>
                <div class="mega">
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                            <li><a href="product.html">Blazers</a></li>
                            <li><a href="product.html">Denim</a></li>
                            <li><a href="product.html">Leggings/Pants</a></li>
                            <li><a href="product.html">Skirts/Shorts</a></li>
                            <li><a href="product.html">Accessories</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <a href="single.html">
                            <p>SUPER<br>SALE!</p>
                        </a>
                    </div>
                </div>
            </li>
            <li><a href="product.html">Hot Deals</a>
                <div class="triangle"></div>
                <div class="mega">
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                            <li><a href="product.html">Blazers</a></li>
                            <li><a href="product.html">Denim</a></li>
                            <li><a href="product.html">Leggings/Pants</a></li>
                            <li><a href="product.html">Skirts/Shorts</a></li>
                            <li><a href="product.html">Accessories</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                        </ul>
                    </div>
                    <div class="mega-flex">
                        <h3>WOMEN</h3>
                        <ul class="mega-list">
                            <li><a href="product.html">Dresses</a></li>
                            <li><a href="product.html">Tops</a></li>
                            <li><a href="product.html">Sweaters/Knits</a></li>
                            <li><a href="product.html">Jackets/Coats</a></li>
                        </ul>
                        <a href="single.html">
                            <p>SUPER<br>SALE!</p>
                        </a>
                    </div>
                </div>
            </li>
        </ul>
    </nav>

    <section class="slider">
        <div class="container slider-content">
            <div class="slider-text">
                <h2><?php echo $h2?></h2>
                <h4><?php echo $h4?></h4>
            </div>
        </div>
    </section>

    <section class="container category">
        <div class="category-left">
            <div class="big">
                <a href="product.html">
                    <h4>HOT DEAL</h4>
                    <h2>FOR MEN</h2>
                </a>
            </div>
            <div class="small">
                <a href="#">
                    <h4>LUXIROUS & TRENDY</h4>
                    <h2>ACCESORIES</h2>
                </a>
            </div>
        </div>
        <div class="category-right">
            <div class="small">
                <a href="#">
                    <h4>30% OFFER</h4>
                    <h2>WOMEN</h2>
                </a>
            </div>
            <div class="big">
                <a href="#">
                    <h4>NEW ARRIVALS</h4>
                    <h2>FOR KIDS</h2>
                </a>
            </div>
        </div>
    </section>

    <section class="container product-block">
        <h2>Fetured Items</h2>
        <p>Shop for items based on what we featured in this week</p>
        <div class="product-box">
            <figure class="product-box-a">
                <a href="single.html">
                    <img src="img/product-1.jpg" alt="product-1" class="product-img">
                    <h3>MANGO PEOPLE T-SHORT</h3>
                    <h4>$52.00</h4>
                </a>
                <a href="cart.html" class="product-to-cart"><img src="img/cart(2).svg" alt="cart"> Add to Cart</a>
            </figure>
            <figure class="product-box-a">
                <a href="single.html">
                    <img src="img/product-2.jpg" alt="product-2" class="product-img">
                    <h3>MANGO PEOPLE T-SHORT</h3>
                    <h4>$52.00</h4>
                </a>
                <a href="cart.html" class="product-to-cart"><img src="img/cart(2).svg" alt="cart"> Add to Cart</a>
            </figure>
            <figure class="product-box-a">
                <a href="single.html">
                    <img src="img/product-3.jpg" alt="product-3" class="product-img">
                    <h3>MANGO PEOPLE T-SHORT</h3>
                    <h4>$52.00</h4>
                </a>
                <a href="cart.html" class="product-to-cart"><img src="img/cart(2).svg" alt="cart"> Add to Cart</a>
            </figure>
            <figure class="product-box-a">
                <a href="single.html">
                    <img src="img/product-4.jpg" alt="product-4" class="product-img">
                    <h3>MANGO PEOPLE T-SHORT</h3>
                    <h4>$52.00</h4>
                </a>
                <a href="cart.html" class="product-to-cart"><img src="img/cart(2).svg" alt="cart"> Add to Cart</a>
            </figure>
            <figure class="product-box-a">
                <a href="single.html">
                    <img src="img/product-5.jpg" alt="product-5" class="product-img">
                    <h3>MANGO PEOPLE T-SHORT</h3>
                    <h4>$52.00</h4>
                </a>
                <a href="cart.html" class="product-to-cart"><img src="img/cart(2).svg" alt="cart"> Add to Cart</a>
            </figure>
            <figure class="product-box-a">
                <a href="single.html">
                    <img src="img/product-6.jpg" alt="product-6" class="product-img">
                    <h3>MANGO PEOPLE T-SHORT</h3>
                    <h4>$52.00</h4>
                </a>
                <a href="cart.html" class="product-to-cart"><img src="img/cart(2).svg" alt="cart"> Add to Cart</a>
            </figure>
            <figure class="product-box-a">
                <a href="single.html">
                    <img src="img/product-7.jpg" alt="product-7" class="product-img">
                    <h3>MANGO PEOPLE T-SHORT</h3>
                    <h4>$52.00</h4>
                </a>
                <a href="cart.html" class="product-to-cart"><img src="img/cart(2).svg" alt="cart"> Add to Cart</a>
            </figure>
            <figure class="product-box-a">
                <a href="single.html">
                    <img src="img/product-8.jpg" alt="product-8" class="product-img">
                    <h3>MANGO PEOPLE T-SHORT</h3>
                    <h4>$52.00</h4>
                </a>
                <a href="cart.html" class="product-to-cart"><img src="img/cart(2).svg" alt="cart"> Add to Cart</a>
            </figure>
        </div>
        <a href="product.html" class="product-button">Browse All Product<i class="fa fa-long-arrow-right"
                                                                           aria-hidden="true"></i></a>
    </section>

    <section class="container feature">
        <div class="feature-left">
            <a href="#">
                <h2>30% <span>OFFER</span></h2>
                <p>FOR WOMEN</p>
            </a>
        </div>
        <ul class="feature-right">
            <li>
                <img src="img/delivery.svg" alt="Free Delivery">
                <figure>
                    <span>Free Delivery</span>
                    <p>Worldwide delivery on all. Authorit tively morph next-generation innovation with extensive
                        models.</p>
                </figure>
            </li>
            <li>
                <img src="img/sale.svg" alt="Sales & discounts">
                <figure>
                    <span>Sales & discounts</span>
                    <p>Worldwide delivery on all. Authorit tively morph next-generation innovation with extensive
                        models.</p>
                </figure>
            </li>
            <li>
                <img src="img/korona.svg" alt="Quality assurance">
                <figure>
                    <span>Quality assurance</span>
                    <p>Worldwide delivery on all. Authorit tively morph next-generation innovation with extensive
                        models.</p>
                </figure>
            </li>
        </ul>
    </section>

    <section class="subscribe">
        <div class="container flex-between">
            <div class="feedback">
                <figure>
                    <div>
                        <img src="img/feedback.png" alt="Bin Burhan foto">
                        <p>“Vestibulum quis porttitor dui! Quisque viverra nunc mi, a&nbsp;pulvinar purus condimentum&nbsp;a. Aliquam
                            condimentum mattis neque sed pretium”</p>
                    </div>
                    <p class="feedback-comment">
                        Bin Burhan<br>
                        <span>Dhaka, Bd</span>
                    </p>
                </figure>
                <a href="#"></a><a href="#" class="active"></a><a href="#"></a>
            </div>
            <div class="subscribe-form">
                <h2>Subscribe</h2>
                <p>FOR OUR NEWLETTER AND PROMOTION</p>
                <form action="send.php" class="flex">
                    <input type="email" required placeholder="Enter Your Email"><input type="submit" value="Subscribe">
                </form>
            </div>
        </div>
    </section>
</div>


<footer>
    <div class="footer container">
        <div class="footer-logo">
            <a href="index.html" class="link-logo">
                <img src="img/logo.png" alt="logo">BRAN<span>D</span>
            </a>
            <p>
                Objectively transition extensive data rather than cross functional solutions. Monotonectally syndicate
                multidisciplinary materials before go forward benefits. Intrinsicly syndicate an expanded array of
                processes and cross-unit partnerships. <br><br>

                Efficiently plagiarize 24/365 action items and focused infomediaries.<br>
                Distinctively seize superior initiatives for wireless technologies. Dynamically optimize.
            </p>
        </div>
        <nav class="footer-menu-top">
            <div>
                <h2>COMPANY</h2>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="product.html">Shop</a></li>
                    <li><a href="#">About</a></li>
                    <li><a href="#">How It Works</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </div>
            <div>
                <h2>INFORMATION</h2>
                <ul>
                    <li><a href="#">Tearms & Condition</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">How to Buy</a></li>
                    <li><a href="#">How to Sell</a></li>
                    <li><a href="#">Promotion</a></li>
                </ul>
            </div>
            <div>
                <h2>SHOP CATEGORY</h2>
                <ul>
                    <li><a href="product.html">Men</a></li>
                    <li><a href="#">Women</a></li>
                    <li><a href="#">Child</a></li>
                    <li><a href="#">Apparel</a></li>
                    <li><a href="#">Brows All</a></li>
                </ul>
            </div>
        </nav>
    </div>

    <div class="footer-bottom">
        <div class="container footer-menu-bottom">
            <div>&copy; <?php echo $year?> Brand All Rights Reserved.</div>
            <div>
                <a href="#"><i class="fa fa-facebook" aria-hidden="true"></i></a>
                <a href="#"><i class="fa fa-twitter" aria-hidden="true"></i></a>
                <a href="#" class="inactive"><i class="fa fa-linkedin" aria-hidden="true"></i></a>
                <a href="#"><i class="fa fa-pinterest-p" aria-hidden="true"></i></a>
                <a href="#"><i class="fa fa-google-plus" aria-hidden="true"></i></a>
            </div>
        </div>
    </div>
</footer>

</body>
</html>