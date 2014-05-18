//
//  ru_ezhoffTabata.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 26.01.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "Tabata.h"
#import "SettingsStorage.h"

@implementation Tabata

NSString *const TimerUpdated = @"TabataTimerUpdated";
NSString *const StateChanged = @"TabataStateChanged";
NSString *const PrepareSignal = @"TabataPrepareSignal";

const int DEFAULT_ROUND_AMOUNT = 8;
const float DEFAULT_STARTING_DURATION = 3.0;
const float DEFAULT_EXERCISE_DURATION = 20.0;
const float DEFAULT_RELAXATION_DURATION = 10.0;
const float UPDATE_INTERVAL = 0.01;

Tabata *tabata;
SettingsStorage *storage;

NSTimer *timer;
TabataStates tabataState = IDLE;
float startingDuration;
float exerciseDuration;
float relaxationDuration;
int roundAmount;
float currentTime;
int currentRound;

+ (Tabata *)getTabata {
    if (tabata == NULL) {
        tabata = [Tabata new];
        storage = [SettingsStorage new];
        startingDuration = [storage loadStartingDuration];
        if (startingDuration == 0) {
            [storage saveStartingDuration:DEFAULT_STARTING_DURATION];
            startingDuration = DEFAULT_STARTING_DURATION;
        }
        exerciseDuration = [storage loadExerciseDuration];
        if (exerciseDuration == 0) {
            [storage saveExerciseDuration:DEFAULT_EXERCISE_DURATION];
            exerciseDuration = DEFAULT_EXERCISE_DURATION;
        }
        relaxationDuration = [storage loadRelaxationDuration];
        if (relaxationDuration == 0) {
            [storage saveRelaxationDuration:DEFAULT_RELAXATION_DURATION];
            relaxationDuration = DEFAULT_RELAXATION_DURATION;
        }
        roundAmount = [storage loadRoundAmount];
        if (roundAmount == 0) {
            [storage saveRoundAmount:DEFAULT_ROUND_AMOUNT];
            roundAmount = DEFAULT_ROUND_AMOUNT;
        }
    }
    return tabata;
}

// Actions
- (void)start {
    timer = [NSTimer scheduledTimerWithTimeInterval:UPDATE_INTERVAL
                                             target:self
                                           selector:@selector(update)
                                           userInfo:nil
                                            repeats:YES];
}

- (void)stop {
    [timer invalidate];
    timer = nil;
    [self reset];
    [[NSNotificationCenter defaultCenter] postNotificationName:StateChanged object:self];
}

- (void)pause {

}

- (void)update {
    switch (tabataState) {
        case IDLE:
            currentRound = 0;
            currentTime = startingDuration;
            [tabata setState:STARTING];
            break;
        case STARTING:
            currentTime -= UPDATE_INTERVAL;
            if ((currentTime > 0.9 && currentTime < 1.1) || (currentTime > 1.9 && currentTime < 2.1)) {
                [[NSNotificationCenter defaultCenter] postNotificationName:PrepareSignal object:self];
            }
            if (currentTime <= 0) {
                currentTime = exerciseDuration;
                ++currentRound;
                [tabata setState:EXERCISE];
            }
            break;
        case EXERCISE:
            currentTime -= UPDATE_INTERVAL;
            if (currentTime <= 0) {
                if (currentRound >= roundAmount) {
                    [self stop];
                }
                else {
                    currentTime = relaxationDuration;
                    [tabata setState:RELAXATION];
                }
            }
            break;
        case RELAXATION:
            currentTime -= UPDATE_INTERVAL;
            if (currentTime <= 0) {
                currentTime = exerciseDuration;
                ++currentRound;
                [tabata setState:EXERCISE];
            }
            break;
        default:
            break;
    }
    [[NSNotificationCenter defaultCenter] postNotificationName:TimerUpdated object:self];
}

- (void)reset {
    [tabata setState:IDLE];
    currentTime = 0;
    currentRound = 0;
}

- (float)getExerciseDuration {
    return exerciseDuration;
}

- (float)getRelaxationDuration {
    return relaxationDuration;
}

- (int)getRoundAmount; {
    return roundAmount;
}

- (float)getCurrentTime; {
    return currentTime;
}

- (int)getCurrentRound {
    return currentRound;
}

- (TabataStates)getState {
    return tabataState;
}

- (void)setExerciseDuration:(float)duration {
    exerciseDuration = duration;
    [storage saveExerciseDuration:duration];
}

- (void)setRelaxationDuration:(float)duration {
    relaxationDuration = duration;
    [storage saveRelaxationDuration:duration];
}

- (void)setRoundAmount:(int)amount {
    roundAmount = amount;
    [storage saveRoundAmount:amount];
}

- (void)setState:(TabataStates)state {
    tabataState = state;
    [[NSNotificationCenter defaultCenter] postNotificationName:StateChanged object:self];
}

@end
