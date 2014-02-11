//
//  ru_ezhoffSettingsViewController.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 26.01.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "ru_ezhoffSettingsViewController.h"
#import "Tabata.h"
#import "SoundEffects.h"

@interface ru_ezhoffSettingsViewController ()

@end

@implementation ru_ezhoffSettingsViewController

Tabata *tabata;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    tabata = [Tabata getTabata];
    _exersiceTimeField.text = [[NSNumber numberWithFloat:[tabata getExersiceDuration]] stringValue];
    _restTimeField.text = [[NSNumber numberWithFloat:[tabata getRelaxationDuration]] stringValue];
    _roundField.text = [[NSNumber numberWithFloat:[tabata getRoundAmount]] stringValue];
    _startingTimeField.text = [[NSNumber numberWithFloat:[tabata getStartingDuration]] stringValue];
    _silenceModeSwitch.on = [SoundEffects isEnabled];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)onSavePressed:(id)sender
{
    [tabata setExerciseDuration:[_exersiceTimeField.text floatValue]];
    [tabata setRelaxationDuration:[_restTimeField.text floatValue]];
    [tabata setRoundAmount:[_roundField.text intValue]];
    [tabata setStartingDuration:[_startingTimeField.text floatValue]];
    [SoundEffects setEnabled:_silenceModeSwitch.on];
}

@end
