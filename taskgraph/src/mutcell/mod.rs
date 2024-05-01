use std::cell::UnsafeCell;

pub struct MutCell<T> {
    value: UnsafeCell<T>,
}

impl<T> MutCell<T> {
    pub fn new(value: T) -> Self {
        Self {
            value: UnsafeCell::new(value),
        }
    }

    pub fn access<R>(&self, mut f: impl FnMut(&T) -> R) -> R {
        let value_ref: &T = unsafe { &(*self.value.get()) };
        f(value_ref)
    }

    pub fn modify<R>(&self, mut f: impl FnMut(&mut T) -> R) -> R {
        let value_ref: &mut T = unsafe { &mut (*self.value.get()) };
        f(value_ref)
    }
}
