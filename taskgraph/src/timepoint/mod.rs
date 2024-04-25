use chrono::Duration;
use std::ops::{Add, Sub};


pub enum TimePoint {
    BeforeEverything,
    AfterEverything,
    Normal{
        seconds_since_epoch: i64,
    },
}

impl Add<Duration> for TimePoint {
    type Output = Self;

    fn add(self, rhs: Duration) -> Self::Output {
        use TimePoint::*;
        
        match self {
            BeforeEverything => BeforeEverything,
            AfterEverything  => AfterEverything,
            Normal { seconds_since_epoch } => {
                Normal {
                    seconds_since_epoch: seconds_since_epoch + rhs.num_seconds()
                }
            },
        }
    }
}

impl Sub<Duration> for TimePoint {
    type Output = Self;

    fn sub(self, rhs: Duration) -> Self::Output {
        use TimePoint::*;
        
        match self {
            BeforeEverything => BeforeEverything,
            AfterEverything  => AfterEverything,
            Normal { seconds_since_epoch } => {
                Normal {
                    seconds_since_epoch: seconds_since_epoch - rhs.num_seconds()
                }
            },
        }
    }
}

impl Sub<TimePoint> for TimePoint {
    type Output = Duration;

    fn sub(self, rhs: Self) -> Self::Output {
        use TimePoint::*;
        
        match self {
            BeforeEverything => match rhs {
                BeforeEverything => Duration::zero(),
                AfterEverything  => Duration::min_value(),
                Normal { .. }    => Duration::min_value(),
            },
            AfterEverything  => match rhs {
                BeforeEverything => Duration::max_value(),
                AfterEverything  => Duration::zero(),
                Normal { .. }    => Duration::max_value(),
            },
            Normal { seconds_since_epoch: lsse } => match rhs {
                BeforeEverything => Duration::max_value(),
                AfterEverything  => Duration::min_value(),
                Normal { seconds_since_epoch: rsse } => Duration::seconds(lsse - rsse)
            },
        }
    }
}
