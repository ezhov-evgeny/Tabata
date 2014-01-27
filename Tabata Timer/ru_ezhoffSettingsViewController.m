//
//  ru_ezhoffSettingsViewController.m
//  Tabata Timer
//
//  Created by Евгений Ежов on 26.01.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import "ru_ezhoffSettingsViewController.h"
#import "Tabata.h"

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
	// Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)onSavePressed:(id)sender
{
    [tabata setExerciseDuration:[_exersiceTimeField.text floatValue]];
}

@end
