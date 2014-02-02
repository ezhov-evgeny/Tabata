//
//  ru_ezhoffTabata.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 26.01.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "Tabata.h"

@implementation Tabata

NSString *const TimerUpdated = @"TabataTimerUpdated";
NSString *const StateChanged = @"TabataStateChanged";

const float UPDATE_INTERVAL = 0.01;

Tabata *tabata;

NSTimer *timer;
TabataStates tabataState = IDLE;
float startingDuration = 3.0;
float exerciseDuration = 3.0;
float relaxationDuration = 3.0;
int roundAmount = 4;
float currentTime;
int currentRound = 0;

+ (Tabata*)getTabata
{
    if (tabata == NULL)
    {
        tabata = [Tabata new];
    }
    return tabata;
}

// Actions
- (void)start
{
    timer = [NSTimer scheduledTimerWithTimeInterval:UPDATE_INTERVAL
                                                target:self
                                                selector:@selector(update)
                                                userInfo:nil
                                                repeats:YES];
}

- (void)stop
{
    [timer invalidate];
    timer = nil;
    [self reset];
    [[NSNotificationCenter defaultCenter] postNotificationName:StateChanged object:self];
}

- (void)pause
{

}

- (void)update
{
    switch (tabataState) {
        case IDLE:
            currentRound = 0;
            currentTime = startingDuration;
            [tabata setState:STARTING];
            break;
        case STARTING:
            currentTime -= UPDATE_INTERVAL;
            if (currentTime <= 0)
            {
                currentTime = exerciseDuration;
                ++currentRound;
                [tabata setState:EXERCISE];
            }
            break;
        case EXERCISE:
            currentTime -= UPDATE_INTERVAL;
            if (currentTime <= 0)
            {
                if (currentRound >= roundAmount)
                {
                    [self stop];
                }
                else
                {
                    currentTime = relaxationDuration;
                    [tabata setState:RELAXATION];
                }
            }
            break;
        case RELAXATION:
            currentTime -= UPDATE_INTERVAL;
            if (currentTime <= 0)
            {
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

- (void)reset
{
    [tabata setState:IDLE];
    currentTime = 0;
    currentRound = 0;
}

// Getters
- (float)getStartingDuration
{
    return startingDuration;
}

- (float)getExersiceDuration
{
    return exerciseDuration;
}

- (float)getRelaxationDuration
{
    return relaxationDuration;
}

- (int)getRoundAmount;
{
    return roundAmount;
}

- (float)getCurrentTime;
{
    return currentTime;
}

- (int)getCurrentRound
{
    return currentRound;
}

- (TabataStates)getState
{
    return tabataState;
}

// Setters
- (void)setStartingDuration:(float) duration
{
    startingDuration = duration;
}
- (void)setExerciseDuration:(float) duration
{
    exerciseDuration = duration;
}
- (void)setRelaxationDuration:(float) duration
{
    relaxationDuration = duration;
}
- (void)setRoundAmount:(int) amount
{
    roundAmount = amount;
}

- (void) setState:(TabataStates)state
{
    tabataState = state;
    [[NSNotificationCenter defaultCenter] postNotificationName:StateChanged object:self];
}

@end
