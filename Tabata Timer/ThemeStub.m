//
//  ThemeStub.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 16.02.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "ThemeStub.h"

@implementation ThemeStub

UIFont *timerFont;

- (id)init {
    self = [super init];
    timerFont = [UIFont fontWithName:@"DS-DIGI" size:100];
    return self;
}

- (UIColor *)getBackgroundColor:(TabataStates)state {
    return [UIColor colorWithRed:1.0 green:1.0 blue:1.0 alpha:1.0];
}

- (UIFont *)getTimerFont:(TabataStates)state {
    return timerFont;
}

- (int)getTimerSize:(TabataStates)state {
    return 100;
}

- (UIColor *)getTimerColor:(TabataStates)state {
    return nil;
}

- (UIFont *)getRoundFont:(TabataStates)state {
    return nil;
}

- (int)getRoundSize:(TabataStates)state {
    return 0;
}

- (UIColor *)getRoundColor:(TabataStates)state {
    return nil;
}

- (UIFont *)getButtonFont:(TabataStates)state {
    return nil;
}

- (int)getButtonSize:(TabataStates)state {
    return 0;
}

- (UIColor *)getButtonColor:(TabataStates)state {
    return nil;
}


@end
