//
//  ru_ezhoffViewController.h
//  Tabata Timer
//
//  Created by Евгений Ежов on 29.12.13.
//  Copyright (c) 2013 Евгений Ежов. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ru_ezhoffViewController : UIViewController

@property (strong, nonatomic) IBOutlet UILabel *timerLabel;

@property (strong, nonatomic) IBOutlet UILabel *roundLabel;

- (IBAction)onActionPressed:(id)sender;

@end
