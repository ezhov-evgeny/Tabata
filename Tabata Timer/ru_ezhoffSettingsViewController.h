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

- (IBAction)onSavePressed:(id)sender;

@end
