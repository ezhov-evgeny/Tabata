//
//  SettingsStorage.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 02.02.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface SettingsStorage : NSObject

- (float)loadStartingDuration;
- (float)loadExerciseDuration;
- (float)loadRelaxationDuration;
- (int)loadRoundAmount;
- (BOOL)loadSoundEnabled;

- (void)saveStartingDuration:(float)duration;
- (void)saveExerciseDuration:(float)duration;
- (void)saveRelaxationDuration:(float)duration;
- (void)saveRoundAmount:(int)amound;
- (void)saveSoundEnabled:(BOOL)enabled;

@end
