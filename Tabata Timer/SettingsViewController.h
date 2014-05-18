//
//  SettingsViewController.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 26.01.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import <UIKit/UIKit.h>

static const int EXERCISE_COMPONENT = 0;

static const int RELAXATION_COMPONENT = 1;

static const int ROUND_COMPONENT = 2;

@interface SettingsViewController : UIViewController <UIPickerViewDataSource, UIPickerViewDelegate>

@property(strong, nonatomic) IBOutlet UIBarButtonItem *saveButton;

@property(strong, nonatomic) IBOutlet UIPickerView *settingsPicker;

@property(strong, nonatomic) IBOutlet UISwitch *silenceModeSwitch;

- (IBAction)onSavePressed:(id)sender;

@end
