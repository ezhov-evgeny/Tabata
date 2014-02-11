//
//  SoundEffects.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 02.02.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface SoundEffects : NSObject

+ (void)registerSoundEffects;

+ (BOOL)isEnabled;

+ (void)setEnabled:(BOOL)newValue;

@end
