//
//  Theme.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 16.02.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Tabata.h"

@protocol Theme <NSObject>

- (UIColor *)getBackgroundColor:(TabataStates)state;

- (UIFont *)getTimerFont:(TabataStates)state;

- (int)getTimerSize:(TabataStates)state;

- (UIColor *)getTimerColor:(TabataStates)state;

- (UIFont *)getRoundFont:(TabataStates)state;

- (int)getRoundSize:(TabataStates)state;

- (UIColor *)getRoundColor:(TabataStates)state;

- (UIFont *)getButtonFont:(TabataStates)state;

- (int)getButtonSize:(TabataStates)state;

- (UIColor *)getButtonColor:(TabataStates)state;

@end
