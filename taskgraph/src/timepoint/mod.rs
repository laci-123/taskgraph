use chrono::Duration;
use std::ops::{Add, Sub};
use serde::{Serialize, Deserialize};


pub type SecondsSinceEpoch = i64;

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
#[derive(PartialEq, Eq, Debug)]
pub enum TimePoint {
    BeforeEverything,
    AfterEverything,
    Normal(SecondsSinceEpoch),
}

impl TimePoint {
    pub fn before_everything() -> Self {
        Self::BeforeEverything
    }

    pub fn after_everything() -> Self {
        Self::AfterEverything
    }
    
    pub fn is_before_everything(&self) -> bool {
        matches!(self, Self::BeforeEverything)
    }

    pub fn is_after_everything(&self) -> bool {
        matches!(self, Self::AfterEverything)
    }
}

impl Add<Duration> for TimePoint {
    type Output = Self;

    fn add(self, rhs: Duration) -> Self::Output {
        use TimePoint::*;
        
        match self {
            BeforeEverything => BeforeEverything,
            AfterEverything  => AfterEverything,
            Normal(sse)      => Normal(sse + rhs.num_seconds()),
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
            Normal(sse)      => Normal(sse - rhs.num_seconds()),
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
            Normal(lsse) => match rhs {
                BeforeEverything => Duration::max_value(),
                AfterEverything  => Duration::min_value(),
                Normal(rsse)     => Duration::seconds(lsse - rsse)
            },
        }
    }
}
