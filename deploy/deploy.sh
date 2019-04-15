# run me from the deploy folder
aws cloudformation validate-template --template-body file://../cf/guardduty.yaml
aws cloudformation validate-template --template-body file://../cf/cloudwatch-events.yaml

##Run me in the master account
aws cloudformation deploy \
    --stack-name test-master-guarddutymaster \
    --tags $(cat tags.properties) \
    --parameter-overrides $(cat guarddutymaster.params.dev.properties) \
    --template-file ../cf/guardduty.yaml \
    --capabilities CAPABILITY_NAMED_IAM

##Run me in the master account to process messages
aws cloudformation deploy \
    --stack-name test-master-guarddutymaster-eventrule \
    --tags $(cat tags.properties) \
    --parameter-overrides $(cat cloudwatch-events.params.dev.1.properties) \
    --template-file ../cf/cloudwatch-events.yaml \
    --capabilities CAPABILITY_NAMED_IAM

##Run me in the member account
##Accounts can delete the CF stack for themselves and they show as resigned in master account
aws cloudformation deploy \
    --stack-name test-master-guarddutymember \
    --tags $(cat tags.properties) \
    --parameter-overrides $(cat guarddutymember.params.dev.properties) \
    --template-file ../cf/guardduty.yaml \
    --capabilities CAPABILITY_NAMED_IAM
