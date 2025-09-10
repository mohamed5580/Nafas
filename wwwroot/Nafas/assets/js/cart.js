    var shoppingCart = (function () {
        var cart = [];

        function Item(id, name, price, count, imageUrl) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.count = count;
            this.imageUrl = imageUrl;
        }

        function saveCart() {
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
        }

        function loadCart() {
            var storedCart = localStorage.getItem('shoppingCart');
            if (storedCart) {
                cart = JSON.parse(storedCart);
            }
        }

        loadCart();

        return {
            addItemToCart: function (id, name, price, count, imageUrl) {
                for (var i = 0; i < cart.length; i++) {
                    if (cart[i].id === id) {
                        cart[i].count++;
                        saveCart();
                        return;
                    }
                }
                var item = new Item(id, name, price, count, imageUrl);
                cart.push(item);
                saveCart();
            },
            setCountForItem: function (id, count) {
                cart.forEach(function (item) {
                    if (item.id === id) {
                        item.count = count;
                    }
                });
                saveCart();
            },
            removeItemById: function (id) {
                cart = cart.filter(item => item.id !== id);
                saveCart();
            },
            clearCart: function () {
                cart = [];
                saveCart();


            },
            totalCount: function () {
                return cart.reduce((sum, item) => sum + item.count, 0);
            },
            totalCart: function () {
                return Number(cart.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(2));
            },
            listCart: function () {
                return cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    count: item.count,
                    imageUrl: item.imageUrl,
                    total: (item.price * item.count).toFixed(2)
                }));
            }
        };
    })();

    $(document).ready(function () {
        function updateCartDisplay() {
            var cartItems = shoppingCart.listCart();
            var total = shoppingCart.totalCart();
            var count = shoppingCart.totalCount();

            $('.total-cart').text(total.toFixed(2));
            $('#cart-badge').text(count);

            if (cartItems.length === 0) {
                $('.cart-items').html(
                    '<tr><td colspan="5" class="text-center">Your cart is empty</td></tr>'
                );
            } else {
                var itemsHtml = '';
                cartItems.forEach(function (item) {
                    itemsHtml += `
    <tr lang="en" dir="ltr">
        <input type="hidden" name="Id" value="${item.id}" />
      <td>
        <div class="d-flex align-items-center">
          <h6 class="mb-0">${item.name}</h6>
          <img src="${item.imageUrl}" alt="${item.name}" class="img-thumbnail ms-3" style="width:60px;height:60px;object-fit:cover;">
        </div>
      </td>
      <td>${item.price} EGP</td>
      <td>
        <div class="input-group" style="max-width:170px;">
          <button class="btn btn-outline-secondary decrease-item" data-id="${item.id}">-</button>
          <input type="text" class="form-control text-center item-count" value="${item.count}" data-id="${item.id}">
          <button class="btn btn-outline-secondary increase-item" data-id="${item.id}">+</button>
        </div>
      </td>
      <td>${item.total} EGP</td>
      <td>
        <button class="btn btn-link text-danger delete-item" data-id="${item.id}">&times;</button>
      </td>
    </tr>`;
                });
                $('.cart-items').html(itemsHtml);
            }
        }

        $(document).on('click', '.add-to-cart', function (e) {
            e.preventDefault();
            var id = $(this).data('id');
            var name = $(this).data('name');
            var price = Number($(this).data('price'));
            var imageUrl = $(this).data('imageurl');
            shoppingCart.addItemToCart(id, name, price, 1, imageUrl);
            updateCartDisplay();
            $(this).closest('.modal').modal('hide');
        });

        $(document).on('click', '.increase-item', function () {
            var id = $(this).data('id');
            var count = parseInt($(`.item-count[data-id="${id}"]`).val());
            shoppingCart.setCountForItem(id, count + 1);
            updateCartDisplay();
        });
        $(document).on('click', '.decrease-item', function () {
            var id = $(this).data('id');
            var count = parseInt($(`.item-count[data-id="${id}"]`).val());
            if (count > 1) {
                shoppingCart.setCountForItem(id, count - 1);
                updateCartDisplay();
            }
        });
        $(document).on('change', '.item-count', function () {
            var id = $(this).data('id');
            var count = parseInt($(this).val());
            if (!isNaN(count) && count > 0) {
                shoppingCart.setCountForItem(id, count);
            }
            updateCartDisplay();
        });
        $(document).on('click', '.delete-item', function () {
            shoppingCart.removeItemById($(this).data('id'));
            updateCartDisplay();
        });

        $(document).on('click', '.clear-carts', function (e) {
            e.preventDefault();
            shoppingCart.clearCart();
            updateCartDisplay();
        });



        $('#logoutForm').on('submit', function () {
            shoppingCart.clearCart();
            updateCartDisplay();
        });



        $(document).on('click', '.complete-order', function (e) {
            e.preventDefault();

            const paymentMethod = $('#PaymentMethod').val();

            // إذا لم يختَر المستخدم طريقة الدفع (القيمة نفسها "اختر طريقة الدفع")
            if (!paymentMethod ) {
                Swal.fire({
                    title: 'اختر طريقة دفع',
                    text: 'لا يمكن إتمام الطلب بدون اختيار طريقة دفع.',
                    icon: 'info',
                    confirmButtonText: 'حسنًا'
                });
                return;
            }

            Swal.fire({
                title: 'هل تريد تأكيد إتمام الشراء؟ ',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، أكمل الشراء',
                cancelButtonText: 'لا، رجوع'
            }).then((result) => {
                if (!result.isConfirmed) return;

                const items = shoppingCart.listCart().map(i => ({
                    productId: i.id,
                    quantity: i.count,
                    unitPrice: i.price
                }));

                if (items.length === 0) {
                    Swal.fire({
                        title: 'سلة الشراء فارغة',
                        text: 'لا يوجد أي منتج في السلة لإتمام الشراء.',
                        icon: 'info',
                        confirmButtonText: 'حسنًا'
                    });
                    return;
                }

                $('#ItemsJson').val(JSON.stringify(items));
                $('#checkoutForm')[0].submit();
                localStorage.removeItem('shoppingCart');
            });
        });


        updateCartDisplay();
    });


     
