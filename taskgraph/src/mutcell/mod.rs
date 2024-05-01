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

    pub fn update<R>(&self, f: impl Fn(&mut T) -> R) -> R {
        let value_ref: &mut T = unsafe { &mut (*self.value.get()) };
        f(value_ref)
    }
}
