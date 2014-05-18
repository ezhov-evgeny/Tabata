//
//  ru_ezhoffTabata.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 26.01.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Tabata : NSObject

        FOUNDATION_EXPORT NSString *const TimerUpdated;
FOUNDATION_EXPORT NSString *const StateChanged;
FOUNDATION_EXPORT NSString *const PrepareSignal;

typedef enum {
    IDLE,
    STARTING,
    PAUSED,
    EXERCISE,
    RELAXATION

} TabataStates;

+ (Tabata *)getTabata;

// Actions
- (void)start;

- (void)stop;

- (void)pause;

- (void)reset;

- (void)update;

- (float)getExerciseDuration;

- (float)getRelaxationDuration;

- (int)getRoundAmount;

- (float)getCurrentTime;

- (int)getCurrentRound;

- (TabataStates)getState;

- (void)setExerciseDuration:(float)duration;

- (void)setRelaxationDuration:(float)duration;

- (void)setRoundAmount:(int)amount;

- (void)setState:(TabataStates)state;
@end
