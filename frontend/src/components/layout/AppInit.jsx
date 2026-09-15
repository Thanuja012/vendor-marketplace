import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../../store/cartSlice';
import { fetchWishlist } from '../../store/wishlistSlice';

export default function AppInit() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  return null;
}
