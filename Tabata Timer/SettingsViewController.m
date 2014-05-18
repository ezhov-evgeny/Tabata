//
//  SettingsViewController.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 26.01.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "SettingsViewController.h"
#import "Tabata.h"
#import "SoundEffects.h"

@interface SettingsViewController ()

@end

@implementation SettingsViewController

Tabata *tabata;

NSInteger tempExerciseDuration;
NSInteger tempRelaxationDuration;
NSInteger tempRoundAmount;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil {
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    tabata = [Tabata getTabata];
    tempExerciseDuration = (int) [tabata getExerciseDuration];
    tempRelaxationDuration = (int) [tabata getRelaxationDuration];
    tempRoundAmount = [tabata getRoundAmount];
    [_settingsPicker selectRow:tempExerciseDuration - 1 inComponent:EXERCISE_COMPONENT animated:true];
    [_settingsPicker selectRow:tempRelaxationDuration - 1 inComponent:RELAXATION_COMPONENT animated:true];
    [_settingsPicker selectRow:tempRoundAmount - 1 inComponent:ROUND_COMPONENT animated:true];
    _silenceModeSwitch.on = [SoundEffects isEnabled];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)onSavePressed:(id)sender {
    [tabata setExerciseDuration:tempExerciseDuration];
    [tabata setRelaxationDuration:tempRelaxationDuration];
    [tabata setRoundAmount:(int) tempRoundAmount];
    [SoundEffects setEnabled:_silenceModeSwitch.on];
    [self.navigationController popToRootViewControllerAnimated:true];
}

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView {
    return 3;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component {
    if (component == ROUND_COMPONENT) {
        return 60;
    }
    return 600;
}

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component {
    switch (component) {
        case EXERCISE_COMPONENT:
            tempExerciseDuration = row + 1;
            break;
        case RELAXATION_COMPONENT:
            tempRelaxationDuration = row + 1;
            break;
        case ROUND_COMPONENT:
            tempRoundAmount = row + 1;
            break;
        default:
            [NSException raise:@"Wrong number of UIPicker component" format:@"Current component number %ld", (long) component];
    }
}

- (NSString *)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component {
    if (component == ROUND_COMPONENT) {
        return [@(row + 1) stringValue];
    }
    return [NSString stringWithFormat:@"%li sec", (long) (row + 1)];
}


@end
