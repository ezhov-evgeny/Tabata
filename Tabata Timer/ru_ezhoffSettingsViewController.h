//
//  ru_ezhoffSettingsViewController.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 26.01.14.
//  Copyright (c) 2014 Евгений Ежов. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ru_ezhoffSettingsViewController : UIViewController

@property (strong, nonatomic) IBOutlet UITextField *exersiceTimeField;

@property (strong, nonatomic) IBOutlet UITextField *restTimeField;

@property (strong, nonatomic) IBOutlet UITextField *roundField;

@property (strong, nonatomic) IBOutlet UITextField *startingTimeField;

@property (strong, nonatomic) IBOutlet UISwitch *silenceModeSwitch;

- (IBAction)onSavePressed:(id)sender;

@end
