use chrono::Duration;
use std::{cmp::Ordering, ops::{Add, Sub}};
use serde::{Serialize, Deserialize};


pub type SecondsSinceEpoch = i64;

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
#[derive(PartialEq, Eq, Debug, Clone, Copy)]
pub enum TimePoint {
    BeforeEverything,
    Normal(SecondsSinceEpoch),
    AfterEverything,
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

impl From<TimePoint> for f64 {
    fn from(tp: TimePoint) -> Self {
        match tp {
            TimePoint::BeforeEverything => f64::NEG_INFINITY,
            TimePoint::Normal(x)        => x as f64,
            TimePoint::AfterEverything  => f64::INFINITY,
        }
    }
}

impl From<f64> for TimePoint {
    fn from(x: f64) -> Self {
        if x.is_infinite() {
            if x.is_sign_negative() {
                TimePoint::BeforeEverything
            }
            else {
                TimePoint::AfterEverything
            }
        }
        else {
            TimePoint::Normal(x as i64)
        }
    }
}

impl PartialOrd for TimePoint {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for TimePoint {
    fn cmp(&self, other: &Self) -> Ordering {
        use TimePoint::*;
        
        match (self, other) {
            (BeforeEverything, BeforeEverything) => Ordering::Equal,
            (BeforeEverything, _)                => Ordering::Less,
            (Normal(_), BeforeEverything)        => Ordering::Greater,
            (Normal(x), Normal(y))               => x.cmp(y),
            (Normal(_), AfterEverything)         => Ordering::Less,
            (AfterEverything, AfterEverything)   => Ordering::Equal,
            (AfterEverything, _)                 => Ordering::Greater, 
        }
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
