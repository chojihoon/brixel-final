/**
 * BRIXEL Extension - 05. Actuators
 * Servo, DC Motor, Stepper Motor, Relay, Solenoid
 */

//% weight=1060 color=#50B91A icon="\uf013" block="05. Actuators"
//% groups="['Servo Motors', 'Servo Driver(PCA9685)', 'Stepper Motors', 'DC모터(L9110)', 'DC모터(L298N)', 'DC모터(L293D)', '듀얼 H-브리지 모터(TB6612FNG)', '듀얼 H-브리지 DC 모터(DRV8833)', 'Relays', 'Solenoid', 'Fan모터', 'Pump모터']"
namespace Actuators05 {


    /********** MG996R 서보 모터 **********/

    // 서보 통합 구현
    let _servoNeutralStop: boolean = false

    //% block="servo %pin servo's angle %angle (°) set to"
    //% angle.min=0 angle.max=180 angle.defl=90
    //% group="Servo Motors" weight=82
    //% inlineInputMode=inline
    export function servoSetAngle(pin: AnalogPin, angle: number): void {
        // 설정된 범위로 클램핑
        let clampedAngle = Math.constrain(angle, _servoMinAngle, _servoMaxAngle)
        pins.servoWritePin(pin, clampedAngle)
    }

    //% block="servo %pin continuous servo rotation speed %speed \\% set to"
    //% speed.min=-100 speed.max=100 speed.defl=50
    //% group="Servo Motors" weight=81
    //% inlineInputMode=inline
    export function servoSetSpeed(pin: AnalogPin, speed: number): void {
        // -100~100을 0~180으로 변환 (90이 정지)
        let clampedSpeed = Math.constrain(speed, -100, 100)
        if (clampedSpeed == 0) {
            pins.servoWritePin(pin, 90)
        } else {
            let angle = Math.map(clampedSpeed, -100, 100, 0, 180)
            pins.servoWritePin(pin, angle)
        }
    }

    //% block="servo %pin stop"
    //% group="Servo Motors" weight=80
    export function servoStop(pin: AnalogPin): void {
        if (_servoNeutralStop) {
            // PWM 신호를 완전히 해제하여 서보 정지
            pins.digitalWritePin(<any>pin, 0)
        } else {
            // 90도(중립) 위치로 이동
            pins.servoWritePin(pin, 90)
        }
    }

    //% block="set servo %pin stop on neutral %enable"
    //% enable.shadow="toggleOnOff" enable.defl=false
    //% group="Servo Motors" weight=79
    export function servoSetNeutralStop(pin: AnalogPin, enable: boolean): void {
        _servoNeutralStop = enable
    }

    // 서보 범위 제한 변수
    let _servoMinAngle: number = 0
    let _servoMaxAngle: number = 180

    //% block="servo servo %pin 's angle %minAngle from %maxAngle through rangeset to"
    //% minAngle.defl=0 maxAngle.defl=180
    //% group="Servo Motors" weight=78
    //% inlineInputMode=inline
    export function servoSetRange(pin: AnalogPin, minAngle: number, maxAngle: number): void {
        // 범위 값 저장 (servoSetAngle에서 클램핑에 사용)
        _servoMinAngle = Math.min(minAngle, maxAngle)
        _servoMaxAngle = Math.max(minAngle, maxAngle)
    }

    //% block="servo %pin servo's pulse %pulse (μs) set to"
    //% pulse.defl=1500
    //% group="Servo Motors" weight=77
    //% inlineInputMode=inline
    export function servoSetPulse(pin: AnalogPin, pulse: number): void {
        // 유효 펄스 범위로 클램핑 (0은 허용하지 않음)
        let clampedPulse = Math.constrain(pulse, 500, 2500)
        pins.servoSetPulse(pin, clampedPulse)
    }

    /**
     * Servo Read Angle (for analog feedback servo)
     * @param pin Feedback pin
     */
    //% block="Servo Pin $pin Read Angle"
    //% pin.defl=AnalogPin.P0
    //% group="Servo Motors" weight=76
    export function servoReadAngle(pin: AnalogPin): number {
        // Read analog value (0-1023)
        let raw = pins.analogReadPin(pin)
        // Convert 0-1023 to 0-180 degrees
        return Math.round(Math.map(raw, 0, 1023, 0, 180))
    }

    /**
     * Servo Read Microseconds (for analog feedback servo)
     * @param pin Feedback pin
     */
    //% block="Servo Pin $pin Read Micros"
    //% pin.defl=AnalogPin.P0
    //% group="Servo Motors" weight=75
    export function servoReadMicros(pin: AnalogPin): number {
        // Read analog value (0-1023)
        let raw = pins.analogReadPin(pin)
        // Convert 0-1023 to 500-2500μs
        return Math.round(Math.map(raw, 0, 1023, 500, 2500))
    }

    /**
     * Servo Is Connected
     * @param pin Feedback pin
     */
    //% block="Servo Pin $pin Connected?"
    //% pin.defl=AnalogPin.P0
    //% group="Servo Motors" weight=74
    export function servoIsConnected(pin: AnalogPin): boolean {
        // Read analog value
        let raw = pins.analogReadPin(pin)
        // If within valid range, considered connected
        return raw > 10 && raw < 1013
    }


    /********** Geekservo **********/

    // Geekservo Direction
    export enum GeekservoDirection {
        //% block="Forward (CW)"
        Forward = 0,
        //% block="Backward (CCW)"
        Backward = 1
    }

    /**
     * 360 Geekservo Set Angle
     * @param pin Servo pin
     * @param angle Angle (0-360)
     */
    //% block="360 Geekservo Pin $pin Set Angle $angle (0~360)"
    //% pin.defl=AnalogPin.P0
    //% angle.min=0 angle.max=360 angle.defl=0
    //% group="Servo Motors" weight=73
    //% inlineInputMode=inline
    export function geekservo360SetAngle(pin: AnalogPin, angle: number): void {
        // Convert 0-360 degrees to 500-2500μs
        let clampedAngle = Math.constrain(angle, 0, 360)
        let pulse = Math.map(clampedAngle, 0, 360, 500, 2500)
        pins.servoSetPulse(pin, pulse)
    }

    /**
     * Geekservo Wheel Mode (continuous rotation)
     * @param pin Servo pin
     * @param speed Speed (0-100)
     * @param direction Direction
     */
    //% block="Geekservo Wheel Pin $pin Speed $speed Direction $direction"
    //% pin.defl=AnalogPin.P0
    //% speed.min=0 speed.max=100 speed.defl=100
    //% direction.defl=GeekservoDirection.Forward
    //% group="Servo Motors" weight=72
    //% inlineInputMode=inline
    export function geekservoWheel(pin: AnalogPin, speed: number, direction: GeekservoDirection): void {
        // Geekservo continuous rotation: 1500μs = stop, 500μs = max CCW, 2500μs = max CW
        let clampedSpeed = Math.constrain(speed, 0, 100)
        let pulse = 1500
        if (clampedSpeed > 0) {
            if (direction == GeekservoDirection.Forward) {
                // Clockwise: 1500 -> 2500
                pulse = Math.map(clampedSpeed, 0, 100, 1500, 2500)
            } else {
                // Counter-clockwise: 1500 -> 500
                pulse = Math.map(clampedSpeed, 0, 100, 1500, 500)
            }
        }
        pins.servoSetPulse(pin, pulse)
    }

    /**
     * Geekservo Stop
     * @param pin Servo pin
     */
    //% block="Geekservo Pin $pin Stop"
    //% pin.defl=AnalogPin.P0
    //% group="Servo Motors" weight=71
    export function geekservoStop(pin: AnalogPin): void {
        pins.servoSetPulse(pin, 1500)
    }


    /********** PCA9685 Servo Driver **********/

    // PCA9685 I2C Address
    export enum PCA9685Address {
        //% block="0x40"
        Addr0x40 = 0x40,
        //% block="0x41"
        Addr0x41 = 0x41,
        //% block="0x42"
        Addr0x42 = 0x42,
        //% block="0x43"
        Addr0x43 = 0x43,
        //% block="0x44"
        Addr0x44 = 0x44,
        //% block="0x45"
        Addr0x45 = 0x45,
        //% block="0x46"
        Addr0x46 = 0x46,
        //% block="0x47"
        Addr0x47 = 0x47
    }

    // PCA9685 Sleep Mode
    export enum PCA9685SleepMode {
        //% block="Wake"
        Wake = 0,
        //% block="Sleep"
        Sleep = 1
    }

    // PCA9685 Data Variables (max 8 drivers)
    let _pca9685Addr: number[] = [0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47]
    let _pca9685Freq: number[] = [50, 50, 50, 50, 50, 50, 50, 50]
    let _pca9685Initialized: boolean[] = [false, false, false, false, false, false, false, false]

    /**
     * PCA9685 write register
     */
    function pca9685WriteReg(index: number, reg: number, value: number): void {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(_pca9685Addr[index - 1], buf)
    }

    /**
     * PCA9685 Servo Driver Setup
     * @param index Driver index (1-8)
     * @param addr I2C address
     * @param freq PWM frequency in Hz
     */
    //% block="Servo Driver(PCA9685) Setup $index I2C Address $addr PWM Frequency $freq Hz"
    //% index.min=1 index.max=8 index.defl=1
    //% addr.defl=PCA9685Address.Addr0x40
    //% freq.min=24 freq.max=1526 freq.defl=50
    //% group="Servo Driver(PCA9685)" weight=60
    //% inlineInputMode=inline
    export function pca9685Setup(index: number, addr: PCA9685Address, freq: number): void {
        let i = index - 1
        _pca9685Addr[i] = addr
        _pca9685Freq[i] = freq

        // Reset PCA9685
        pca9685WriteReg(index, 0x00, 0x00)
        basic.pause(5)

        // Set sleep mode to configure frequency
        pca9685WriteReg(index, 0x00, 0x10)
        basic.pause(5)

        // Calculate prescale value: prescale = round(25MHz / (4096 * freq)) - 1
        let prescale = Math.round(25000000 / (4096 * freq)) - 1
        pca9685WriteReg(index, 0xFE, prescale)

        // Wake up
        pca9685WriteReg(index, 0x00, 0x00)
        basic.pause(5)

        // Auto-increment enabled
        pca9685WriteReg(index, 0x00, 0xA0)

        _pca9685Initialized[i] = true
    }

    /**
     * PCA9685 Set Servo Angle
     * @param index Driver index
     * @param channel Channel (0-15)
     * @param angle Angle in degrees
     */
    //% block="Servo Driver $index Channel $channel Angle Set $angle degree"
    //% index.min=1 index.max=8 index.defl=1
    //% channel.min=0 channel.max=15 channel.defl=0
    //% angle.min=0 angle.max=180 angle.defl=90
    //% group="Servo Driver(PCA9685)" weight=59
    //% inlineInputMode=inline
    export function pca9685SetAngle(index: number, channel: number, angle: number): void {
        if (!_pca9685Initialized[index - 1]) return
        // Convert angle to pulse width (500-2500μs for 0-180°)
        let clampedAngle = Math.constrain(angle, 0, 180)
        let pulseWidth = Math.map(clampedAngle, 0, 180, 500, 2500)
        // Convert to PWM value (at 50Hz, 1 cycle = 20000μs, 4096 steps)
        let pwmValue = Math.round(pulseWidth * 4096 / (1000000 / _pca9685Freq[index - 1]))
        pca9685SetPWM(index, channel, 0, pwmValue)
    }

    /**
     * PCA9685 Set Servo Pulse
     * @param index Driver index
     * @param channel Channel (0-15)
     * @param pulse Pulse width in microseconds
     */
    //% block="Servo Driver $index Channel $channel Pulse Set $pulse Microseconds"
    //% index.min=1 index.max=8 index.defl=1
    //% channel.min=0 channel.max=15 channel.defl=0
    //% pulse.defl=1500
    //% group="Servo Driver(PCA9685)" weight=58
    //% inlineInputMode=inline
    export function pca9685SetPulse(index: number, channel: number, pulse: number): void {
        if (!_pca9685Initialized[index - 1]) return
        // Convert to PWM value
        let clampedPulse = Math.constrain(pulse, 500, 2500)
        let pwmValue = Math.round(clampedPulse * 4096 / (1000000 / _pca9685Freq[index - 1]))
        pca9685SetPWM(index, channel, 0, pwmValue)
    }

    /**
     * PCA9685 Set PWM Value
     * @param index Driver index
     * @param channel Channel (0-15)
     * @param value PWM value (0-4095)
     */
    //% block="Servo Driver $index Channel $channel PWM Value $value (0-4095)"
    //% index.min=1 index.max=8 index.defl=1
    //% channel.min=0 channel.max=15 channel.defl=0
    //% value.min=0 value.max=4095 value.defl=2048
    //% group="Servo Driver(PCA9685)" weight=57
    //% inlineInputMode=inline
    export function pca9685SetPWMValue(index: number, channel: number, value: number): void {
        pca9685SetPWM(index, channel, 0, value)
    }

    /**
     * PCA9685 Set PWM On/Off
     * @param index Driver index
     * @param channel Channel (0-15)
     * @param on On time (0-4095)
     * @param off Off time (0-4095)
     */
    //% block="Servo Driver $index Channel $channel PWM On $on Off $off"
    //% index.min=1 index.max=8 index.defl=1
    //% channel.min=0 channel.max=15 channel.defl=0
    //% on.min=0 on.max=4095 on.defl=0
    //% off.min=0 off.max=4095 off.defl=2048
    //% group="Servo Driver(PCA9685)" weight=56
    //% inlineInputMode=inline
    export function pca9685SetPWM(index: number, channel: number, on: number, off: number): void {
        let i = index - 1
        if (i < 0 || i >= 8 || !_pca9685Initialized[i]) return
        let clampedChannel = Math.constrain(channel, 0, 15)
        let clampedOn = Math.constrain(on, 0, 4095)
        let clampedOff = Math.constrain(off, 0, 4095)
        let reg = 0x06 + clampedChannel * 4
        let buf = pins.createBuffer(5)
        buf[0] = reg
        buf[1] = clampedOn & 0xFF
        buf[2] = (clampedOn >> 8) & 0xFF
        buf[3] = clampedOff & 0xFF
        buf[4] = (clampedOff >> 8) & 0xFF
        pins.i2cWriteBuffer(_pca9685Addr[i], buf)
    }

    /**
     * PCA9685 Sleep/Wake
     * @param index Driver index
     * @param mode Sleep mode
     */
    //% block="Servo Driver $index $mode"
    //% index.min=1 index.max=8 index.defl=1
    //% mode.defl=PCA9685SleepMode.Wake
    //% group="Servo Driver(PCA9685)" weight=55
    export function pca9685Sleep(index: number, mode: PCA9685SleepMode): void {
        if (mode == PCA9685SleepMode.Sleep) {
            pca9685WriteReg(index, 0x00, 0x10)
        } else {
            pca9685WriteReg(index, 0x00, 0xA0)
        }
    }

    /**
     * PCA9685 Set Multiple Servos
     * @param index Driver index
     * @param ch1 Channel 1 angle
     * @param ch2 Channel 2 angle
     * @param ch3 Channel 3 angle
     * @param ch4 Channel 4 angle
     */
    //% block="Servo Driver $index Multi Servo Set Ch1 $ch1 ° Ch2 $ch2 ° Ch3 $ch3 ° Ch4 $ch4 °"
    //% index.min=1 index.max=8 index.defl=1
    //% ch1.min=0 ch1.max=180 ch1.defl=90
    //% ch2.min=0 ch2.max=180 ch2.defl=90
    //% ch3.min=0 ch3.max=180 ch3.defl=90
    //% ch4.min=0 ch4.max=180 ch4.defl=90
    //% group="Servo Driver(PCA9685)" weight=54
    //% inlineInputMode=inline
    export function pca9685SetMultiServo(index: number, ch1: number, ch2: number, ch3: number, ch4: number): void {
        pca9685SetAngle(index, 0, ch1)
        pca9685SetAngle(index, 1, ch2)
        pca9685SetAngle(index, 2, ch3)
        pca9685SetAngle(index, 3, ch4)
    }

    /**
     * PCA9685 Set LED Brightness
     * @param index Driver index
     * @param channel Channel (0-15)
     * @param brightness Brightness (0-100%)
     */
    //% block="Servo Driver $index Channel $channel LED Brightness $brightness \\%"
    //% index.min=1 index.max=8 index.defl=1
    //% channel.min=0 channel.max=15 channel.defl=0
    //% brightness.min=0 brightness.max=100 brightness.defl=50
    //% group="Servo Driver(PCA9685)" weight=53
    //% inlineInputMode=inline
    export function pca9685SetLED(index: number, channel: number, brightness: number): void {
        let pwmValue = Math.round(brightness * 4095 / 100)
        pca9685SetPWM(index, channel, 0, pwmValue)
    }


    /********** NEMA17 스테퍼 모터 **********/

    // 스테퍼 드라이버 타입
    export enum StepperDriver {
        //% block="Driver(2pin)"
        Driver2Pin = 0,
        //% block="ULN2003(4pin)"
        ULN2003 = 1
    }

    // 스테퍼 이동 타입
    export enum StepperMoveType {
        //% block="Move to Absolute"
        Absolute = 0,
        //% block="Move to Relative"
        Relative = 1
    }

    // 스테퍼 동작
    export enum StepperAction {
        //% block="Run"
        Run = 0,
        //% block="Stop"
        Stop = 1
    }

    // 스테퍼 상태
    export enum StepperStatus {
        //% block="Current Position"
        Position = 0,
        //% block="Running"
        Running = 1
    }

    // 스테퍼 모터 데이터 (최대 4개)
    let _stepperDirPin: DigitalPin[] = [DigitalPin.P0, DigitalPin.P0, DigitalPin.P0, DigitalPin.P0]
    let _stepperStepPin: DigitalPin[] = [DigitalPin.P1, DigitalPin.P1, DigitalPin.P1, DigitalPin.P1]
    let _stepperMaxSpeed: number[] = [1000, 1000, 1000, 1000]
    let _stepperAccel: number[] = [50, 50, 50, 50]
    let _stepperSpeed: number[] = [200, 200, 200, 200]
    let _stepperSteps: number[] = [200, 200, 200, 200]
    let _stepperPosition: number[] = [0, 0, 0, 0]
    let _stepperTarget: number[] = [0, 0, 0, 0]
    let _stepperRunning: boolean[] = [false, false, false, false]

    //% block="Stepper Motor(A4988) Driver( $index ) $driver : DIR Pin $dirPin , Step Pin $stepPin Setup"
    //% index.min=1 index.max=4 index.defl=1
    //% dirPin.defl=DigitalPin.P8
    //% stepPin.defl=DigitalPin.P9
    //% group="Stepper Motors" weight=76
    //% inlineInputMode=inline
    export function stepperSetup(index: number, driver: StepperDriver, dirPin: DigitalPin, stepPin: DigitalPin): void {
        let i = index - 1
        _stepperDirPin[i] = dirPin
        _stepperStepPin[i] = stepPin
    }

    //% block="Stepper Motor $index : Max Speed $maxSpeed , Acceleration $accel , Speed Set $speed , Step Set $steps"
    //% index.min=1 index.max=4 index.defl=1
    //% maxSpeed.defl=1000 accel.defl=50 speed.defl=200 steps.defl=200
    //% group="Stepper Motors" weight=75
    //% inlineInputMode=inline
    export function stepperConfig(index: number, maxSpeed: number, accel: number, speed: number, steps: number): void {
        let i = index - 1
        _stepperMaxSpeed[i] = maxSpeed
        _stepperAccel[i] = accel
        _stepperSpeed[i] = speed
        _stepperSteps[i] = steps
    }

    //% block="Stepper Motor $index : $moveType $position"
    //% index.min=1 index.max=4 index.defl=1
    //% position.defl=200
    //% group="Stepper Motors" weight=74
    //% inlineInputMode=inline
    export function stepperMove(index: number, moveType: StepperMoveType, position: number): void {
        let i = index - 1
        if (moveType == StepperMoveType.Absolute) {
            _stepperTarget[i] = position
        } else {
            _stepperTarget[i] = _stepperPosition[i] + position
        }
    }

    //% block="Stepper Motor $index : $action"
    //% index.min=1 index.max=4 index.defl=1
    //% group="Stepper Motors" weight=73
    export function stepperAction(index: number, action: StepperAction): void {
        let i = index - 1
        if (action == StepperAction.Run) {
            _stepperRunning[i] = true
            let steps = _stepperTarget[i] - _stepperPosition[i]
            let dir = steps > 0 ? 1 : 0
            pins.digitalWritePin(_stepperDirPin[i], dir)

            let delay = Math.floor(1000000 / _stepperSpeed[i] / 2)
            for (let s = 0; s < Math.abs(steps); s++) {
                if (!_stepperRunning[i]) break
                pins.digitalWritePin(_stepperStepPin[i], 1)
                control.waitMicros(delay)
                pins.digitalWritePin(_stepperStepPin[i], 0)
                control.waitMicros(delay)
                _stepperPosition[i] += dir ? 1 : -1
            }
            _stepperRunning[i] = false
        } else {
            _stepperRunning[i] = false
        }
    }

    //% block="Stepper Motor $index : $status"
    //% index.min=1 index.max=4 index.defl=1
    //% group="Stepper Motors" weight=72
    export function stepperGetStatus(index: number, status: StepperStatus): number {
        let i = index - 1
        if (status == StepperStatus.Position) {
            return _stepperPosition[i]
        }
        return _stepperRunning[i] ? 1 : 0
    }


    /********** 28BYJ-48 Stepper Motor (4-pin ULN2003) **********/

    // 28BYJ-48 Motor Type
    export enum Stepper28BYJType {
        //% block="28BYJ-48"
        BYJ48 = 0,
        //% block="ULN2003"
        ULN2003 = 1,
        //% block="Custom"
        Custom = 2
    }

    // 28BYJ-48 Pin Mode
    export enum Stepper28BYJPinMode {
        //% block="4pin"
        Pin4 = 0,
        //% block="2pin"
        Pin2 = 1
    }

    // 28BYJ-48 Move Unit
    export enum Stepper28BYJUnit {
        //% block="Step"
        Step = 0,
        //% block="Degree"
        Degree = 1,
        //% block="Revolution"
        Revolution = 2
    }

    // 28BYJ-48 Data Variables (max 4 motors)
    let _28byj_in1: DigitalPin[] = [DigitalPin.P8, DigitalPin.P8, DigitalPin.P8, DigitalPin.P8]
    let _28byj_in2: DigitalPin[] = [DigitalPin.P9, DigitalPin.P9, DigitalPin.P9, DigitalPin.P9]
    let _28byj_in3: DigitalPin[] = [DigitalPin.P10, DigitalPin.P10, DigitalPin.P10, DigitalPin.P10]
    let _28byj_in4: DigitalPin[] = [DigitalPin.P11, DigitalPin.P11, DigitalPin.P11, DigitalPin.P11]
    let _28byj_rpm: number[] = [10, 10, 10, 10]
    let _28byj_position: number[] = [0, 0, 0, 0]
    let _28byj_target: number[] = [0, 0, 0, 0]
    let _28byj_stepsPerRev: number = 2048  // 28BYJ-48 steps per revolution

    // Half-step sequence for 28BYJ-48
    const _28byj_sequence: number[][] = [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 1],
        [0, 0, 0, 1],
        [1, 0, 0, 1]
    ]

    /**
     * 28BYJ-48 Stepper Motor Setup (4-pin)
     * @param motorType Motor type
     * @param index Motor index (1-4)
     * @param pinMode Pin mode
     * @param in1 IN1 pin
     * @param in2 IN2 pin
     * @param in3 IN3 pin
     * @param in4 IN4 pin
     */
    //% block="Stepper Motor( $motorType & $index ) $pinMode Connection Pin: IN1 $in1 IN2 $in2 IN3 $in3 IN4 $in4"
    //% motorType.defl=Stepper28BYJType.BYJ48
    //% index.min=1 index.max=4 index.defl=1
    //% pinMode.defl=Stepper28BYJPinMode.Pin4
    //% in1.defl=DigitalPin.P8
    //% in2.defl=DigitalPin.P9
    //% in3.defl=DigitalPin.P10
    //% in4.defl=DigitalPin.P11
    //% group="Stepper Motors" weight=69
    //% inlineInputMode=inline
    export function stepper28BYJSetup(motorType: Stepper28BYJType, index: number, pinMode: Stepper28BYJPinMode, in1: DigitalPin, in2: DigitalPin, in3: DigitalPin, in4: DigitalPin): void {
        let i = index - 1
        _28byj_in1[i] = in1
        _28byj_in2[i] = in2
        _28byj_in3[i] = in3
        _28byj_in4[i] = in4
    }

    /**
     * 28BYJ-48 Set RPM
     * @param index Motor index
     * @param rpm Speed in RPM
     */
    //% block="Stepper Motor $index : Rotation Speed $rpm RPM"
    //% index.min=1 index.max=4 index.defl=1
    //% rpm.min=1 rpm.max=15 rpm.defl=10
    //% group="Stepper Motors" weight=68
    export function stepper28BYJSetRPM(index: number, rpm: number): void {
        let i = index - 1
        _28byj_rpm[i] = rpm
    }

    /**
     * 28BYJ-48 Set Move Target
     * @param index Motor index
     * @param unit Move unit
     * @param value Move value
     */
    //% block="Stepper Motor $index : $unit by $value Move Set"
    //% index.min=1 index.max=4 index.defl=1
    //% unit.defl=Stepper28BYJUnit.Step
    //% value.defl=35
    //% group="Stepper Motors" weight=67
    //% inlineInputMode=inline
    export function stepper28BYJSetMove(index: number, unit: Stepper28BYJUnit, value: number): void {
        let i = index - 1
        let steps = value

        if (unit == Stepper28BYJUnit.Degree) {
            steps = Math.round(value * _28byj_stepsPerRev / 360)
        } else if (unit == Stepper28BYJUnit.Revolution) {
            steps = Math.round(value * _28byj_stepsPerRev)
        }

        _28byj_target[i] = _28byj_position[i] + steps
    }

    /**
     * 28BYJ-48 Move Motor
     * @param index Motor index
     */
    //% block="Stepper Motor $index : Move"
    //% index.min=1 index.max=4 index.defl=1
    //% group="Stepper Motors" weight=66
    export function stepper28BYJMove(index: number): void {
        let i = index - 1
        let stepsToMove = _28byj_target[i] - _28byj_position[i]
        let direction = stepsToMove > 0 ? 1 : -1
        stepsToMove = Math.abs(stepsToMove)

        // Calculate delay based on RPM
        // 28BYJ-48: 2048 steps/rev, delay = 60000000 / (rpm * 2048 * 8) microseconds
        let delayUs = Math.floor(60000000 / (_28byj_rpm[i] * _28byj_stepsPerRev))

        let seqIndex = 0
        for (let s = 0; s < stepsToMove; s++) {
            // Set pins according to sequence
            pins.digitalWritePin(_28byj_in1[i], _28byj_sequence[seqIndex][0])
            pins.digitalWritePin(_28byj_in2[i], _28byj_sequence[seqIndex][1])
            pins.digitalWritePin(_28byj_in3[i], _28byj_sequence[seqIndex][2])
            pins.digitalWritePin(_28byj_in4[i], _28byj_sequence[seqIndex][3])

            // Next sequence step
            if (direction > 0) {
                seqIndex = (seqIndex + 1) % 8
            } else {
                seqIndex = (seqIndex + 7) % 8
            }

            _28byj_position[i] += direction

            control.waitMicros(delayUs)
        }

        // Turn off all coils
        pins.digitalWritePin(_28byj_in1[i], 0)
        pins.digitalWritePin(_28byj_in2[i], 0)
        pins.digitalWritePin(_28byj_in3[i], 0)
        pins.digitalWritePin(_28byj_in4[i], 0)
    }

    /**
     * 28BYJ-48 Stop Motor
     * @param index Motor index
     */
    //% block="Stepper Motor $index : Stop"
    //% index.min=1 index.max=4 index.defl=1
    //% group="Stepper Motors" weight=65
    export function stepper28BYJStop(index: number): void {
        let i = index - 1
        pins.digitalWritePin(_28byj_in1[i], 0)
        pins.digitalWritePin(_28byj_in2[i], 0)
        pins.digitalWritePin(_28byj_in3[i], 0)
        pins.digitalWritePin(_28byj_in4[i], 0)
        _28byj_target[i] = _28byj_position[i]
    }

    /**
     * 28BYJ-48 Get Position
     * @param index Motor index
     */
    //% block="Stepper Motor $index : Position"
    //% index.min=1 index.max=4 index.defl=1
    //% group="Stepper Motors" weight=64
    export function stepper28BYJGetPosition(index: number): number {
        return _28byj_position[index - 1]
    }

    /**
     * 28BYJ-48 Reset Position
     * @param index Motor index
     */
    //% block="Stepper Motor $index : Reset Position"
    //% index.min=1 index.max=4 index.defl=1
    //% group="Stepper Motors" weight=63
    export function stepper28BYJResetPosition(index: number): void {
        let i = index - 1
        _28byj_position[i] = 0
        _28byj_target[i] = 0
    }


    /********** L9110 모터 드라이버 **********/

    // L9110 방향
    export enum L9110Direction {
        //% block="Clockwise"
        Clockwise = 0,
        //% block="Counter Clockwise"
        CounterClockwise = 1
    }

    // L9110 핀 저장 변수 (최대 4개 모터)
    let _l9110PinA: AnalogPin[] = [AnalogPin.P0, AnalogPin.P0, AnalogPin.P0, AnalogPin.P0]
    let _l9110PinB: AnalogPin[] = [AnalogPin.P1, AnalogPin.P1, AnalogPin.P1, AnalogPin.P1]

    /**
     * L9110 Motor Pin Setup
     * @param motor Motor number (1-4)
     * @param pinA Pin A
     * @param pinB Pin B
     */
    //% block="DC Motor(L9110) $motor : Pin A $pinA , Pin B $pinB Setup"
    //% motor.min=1 motor.max=4 motor.defl=1
    //% pinA.defl=AnalogPin.P5
    //% pinB.defl=AnalogPin.P6
    //% group="DC모터(L9110)" weight=105
    //% inlineInputMode=inline
    export function l9110SetPins(motor: number, pinA: AnalogPin, pinB: AnalogPin): void {
        let i = motor - 1
        _l9110PinA[i] = pinA
        _l9110PinB[i] = pinB
    }

    /**
     * L9110 Motor Run
     * @param motor Motor number (1-4)
     * @param speed Speed (0-255)
     * @param direction Direction
     */
    //% block="DC Motor $motor : Speed $speed , Direction $direction Rotate"
    //% motor.min=1 motor.max=4 motor.defl=1
    //% speed.min=0 speed.max=255 speed.defl=150
    //% direction.defl=L9110Direction.Clockwise
    //% group="DC모터(L9110)" weight=104
    //% inlineInputMode=inline
    export function l9110Run(motor: number, speed: number, direction: L9110Direction): void {
        let i = motor - 1
        if (i < 0 || i >= 4) return
        let clampedSpeed = Math.constrain(speed, 0, 255)
        let pwm = Math.map(clampedSpeed, 0, 255, 0, 1023)

        if (direction == L9110Direction.Clockwise) {
            pins.analogWritePin(_l9110PinA[i], pwm)
            pins.analogWritePin(_l9110PinB[i], 0)
        } else {
            pins.analogWritePin(_l9110PinA[i], 0)
            pins.analogWritePin(_l9110PinB[i], pwm)
        }
    }

    /**
     * L9110 Motor Stop
     * @param motor Motor number (1-4)
     */
    //% block="DC Motor $motor : Stop"
    //% motor.min=1 motor.max=4 motor.defl=1
    //% group="DC모터(L9110)" weight=103
    export function l9110Stop(motor: number): void {
        let i = motor - 1
        pins.analogWritePin(_l9110PinA[i], 0)
        pins.analogWritePin(_l9110PinB[i], 0)
    }


    /********** L298N 모터 드라이버 **********/

    // L298N 핀 저장 변수
    let _l298nENA: AnalogPin = AnalogPin.P0
    let _l298nIN1: DigitalPin = DigitalPin.P1
    let _l298nIN2: DigitalPin = DigitalPin.P2
    let _l298nENB: AnalogPin = AnalogPin.P3
    let _l298nIN3: DigitalPin = DigitalPin.P4
    let _l298nIN4: DigitalPin = DigitalPin.P5

    //% block="L298N motorA pin set ENA %ena IN1 %in1 IN2 %in2"
    //% group="DC모터(L298N)" weight=100
    export function l298nSetPinsA(ena: AnalogPin, in1: DigitalPin, in2: DigitalPin): void {
        _l298nENA = ena
        _l298nIN1 = in1
        _l298nIN2 = in2
    }

    //% block="L298N motorB pin set ENB %enb IN3 %in3 IN4 %in4"
    //% group="DC모터(L298N)" weight=99
    export function l298nSetPinsB(enb: AnalogPin, in3: DigitalPin, in4: DigitalPin): void {
        _l298nENB = enb
        _l298nIN3 = in3
        _l298nIN4 = in4
    }

    //% block="L298N motorA speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% group="DC모터(L298N)" weight=98
    export function l298nMotorA(speed: number): void {
        let pwm = Math.abs(speed) * 10.23
        if (speed > 0) {
            pins.digitalWritePin(_l298nIN1, 1)
            pins.digitalWritePin(_l298nIN2, 0)
        } else if (speed < 0) {
            pins.digitalWritePin(_l298nIN1, 0)
            pins.digitalWritePin(_l298nIN2, 1)
        } else {
            pins.digitalWritePin(_l298nIN1, 0)
            pins.digitalWritePin(_l298nIN2, 0)
        }
        pins.analogWritePin(_l298nENA, pwm)
    }

    //% block="L298N motorB speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% group="DC모터(L298N)" weight=97
    export function l298nMotorB(speed: number): void {
        let pwm = Math.abs(speed) * 10.23
        if (speed > 0) {
            pins.digitalWritePin(_l298nIN3, 1)
            pins.digitalWritePin(_l298nIN4, 0)
        } else if (speed < 0) {
            pins.digitalWritePin(_l298nIN3, 0)
            pins.digitalWritePin(_l298nIN4, 1)
        } else {
            pins.digitalWritePin(_l298nIN3, 0)
            pins.digitalWritePin(_l298nIN4, 0)
        }
        pins.analogWritePin(_l298nENB, pwm)
    }


    /********** L293D 모터 드라이버 **********/

    // L293D 핀 저장 변수
    let _l293dEN1: AnalogPin = AnalogPin.P0
    let _l293dIN1: DigitalPin = DigitalPin.P1
    let _l293dIN2: DigitalPin = DigitalPin.P2
    let _l293dEN2: AnalogPin = AnalogPin.P3
    let _l293dIN3: DigitalPin = DigitalPin.P4
    let _l293dIN4: DigitalPin = DigitalPin.P5

    //% block="L293D motor1 pin set EN1 %en1 IN1 %in1 IN2 %in2"
    //% group="DC모터(L293D)" weight=96
    export function l293dSetPins1(en1: AnalogPin, in1: DigitalPin, in2: DigitalPin): void {
        _l293dEN1 = en1
        _l293dIN1 = in1
        _l293dIN2 = in2
    }

    //% block="L293D motor2 pin set EN2 %en2 IN3 %in3 IN4 %in4"
    //% group="DC모터(L293D)" weight=95
    export function l293dSetPins2(en2: AnalogPin, in3: DigitalPin, in4: DigitalPin): void {
        _l293dEN2 = en2
        _l293dIN3 = in3
        _l293dIN4 = in4
    }

    //% block="L293D motor1 speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% group="DC모터(L293D)" weight=94
    export function l293dMotor1(speed: number): void {
        let pwm = Math.abs(speed) * 10.23
        if (speed > 0) {
            pins.digitalWritePin(_l293dIN1, 1)
            pins.digitalWritePin(_l293dIN2, 0)
        } else if (speed < 0) {
            pins.digitalWritePin(_l293dIN1, 0)
            pins.digitalWritePin(_l293dIN2, 1)
        } else {
            pins.digitalWritePin(_l293dIN1, 0)
            pins.digitalWritePin(_l293dIN2, 0)
        }
        pins.analogWritePin(_l293dEN1, pwm)
    }

    //% block="L293D motor2 speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% group="DC모터(L293D)" weight=93
    export function l293dMotor2(speed: number): void {
        let pwm = Math.abs(speed) * 10.23
        if (speed > 0) {
            pins.digitalWritePin(_l293dIN3, 1)
            pins.digitalWritePin(_l293dIN4, 0)
        } else if (speed < 0) {
            pins.digitalWritePin(_l293dIN3, 0)
            pins.digitalWritePin(_l293dIN4, 1)
        } else {
            pins.digitalWritePin(_l293dIN3, 0)
            pins.digitalWritePin(_l293dIN4, 0)
        }
        pins.analogWritePin(_l293dEN2, pwm)
    }


    /********** TB6612FNG 모터 드라이버 **********/

    // TB6612FNG 핀 저장 변수
    let _tb6612PWMA: AnalogPin = AnalogPin.P0
    let _tb6612AIN1: DigitalPin = DigitalPin.P1
    let _tb6612AIN2: DigitalPin = DigitalPin.P2
    let _tb6612PWMB: AnalogPin = AnalogPin.P3
    let _tb6612BIN1: DigitalPin = DigitalPin.P4
    let _tb6612BIN2: DigitalPin = DigitalPin.P5
    let _tb6612STBY: DigitalPin = DigitalPin.P6

    //% block="TB6612FNG pin set PWMA %pwma AIN1 %ain1 AIN2 %ain2 STBY %stby"
    //% group="듀얼 H-브리지 모터(TB6612FNG)" weight=92
    export function tb6612SetPinsA(pwma: AnalogPin, ain1: DigitalPin, ain2: DigitalPin, stby: DigitalPin): void {
        _tb6612PWMA = pwma
        _tb6612AIN1 = ain1
        _tb6612AIN2 = ain2
        _tb6612STBY = stby
        pins.digitalWritePin(_tb6612STBY, 1)
    }

    //% block="TB6612FNG motorB pin set PWMB %pwmb BIN1 %bin1 BIN2 %bin2"
    //% group="듀얼 H-브리지 모터(TB6612FNG)" weight=91
    export function tb6612SetPinsB(pwmb: AnalogPin, bin1: DigitalPin, bin2: DigitalPin): void {
        _tb6612PWMB = pwmb
        _tb6612BIN1 = bin1
        _tb6612BIN2 = bin2
    }

    //% block="TB6612FNG motorA speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% group="듀얼 H-브리지 모터(TB6612FNG)" weight=90
    export function tb6612MotorA(speed: number): void {
        let pwm = Math.abs(speed) * 10.23
        if (speed > 0) {
            pins.digitalWritePin(_tb6612AIN1, 1)
            pins.digitalWritePin(_tb6612AIN2, 0)
        } else if (speed < 0) {
            pins.digitalWritePin(_tb6612AIN1, 0)
            pins.digitalWritePin(_tb6612AIN2, 1)
        } else {
            pins.digitalWritePin(_tb6612AIN1, 0)
            pins.digitalWritePin(_tb6612AIN2, 0)
        }
        pins.analogWritePin(_tb6612PWMA, pwm)
    }

    //% block="TB6612FNG motorB speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% group="듀얼 H-브리지 모터(TB6612FNG)" weight=89
    export function tb6612MotorB(speed: number): void {
        let pwm = Math.abs(speed) * 10.23
        if (speed > 0) {
            pins.digitalWritePin(_tb6612BIN1, 1)
            pins.digitalWritePin(_tb6612BIN2, 0)
        } else if (speed < 0) {
            pins.digitalWritePin(_tb6612BIN1, 0)
            pins.digitalWritePin(_tb6612BIN2, 1)
        } else {
            pins.digitalWritePin(_tb6612BIN1, 0)
            pins.digitalWritePin(_tb6612BIN2, 0)
        }
        pins.analogWritePin(_tb6612PWMB, pwm)
    }


    /********** DRV8833 모터 드라이버 **********/

    // DRV8833 핀 저장 변수
    let _drv8833AIN1: AnalogPin = AnalogPin.P0
    let _drv8833AIN2: AnalogPin = AnalogPin.P1
    let _drv8833BIN1: AnalogPin = AnalogPin.P2
    let _drv8833BIN2: AnalogPin = AnalogPin.P3

    //% block="DRV8833 motorA pin set AIN1 %ain1 AIN2 %ain2"
    //% group="듀얼 H-브리지 DC 모터(DRV8833)" weight=88
    export function drv8833SetPinsA(ain1: AnalogPin, ain2: AnalogPin): void {
        _drv8833AIN1 = ain1
        _drv8833AIN2 = ain2
    }

    //% block="DRV8833 motorB pin set BIN1 %bin1 BIN2 %bin2"
    //% group="듀얼 H-브리지 DC 모터(DRV8833)" weight=87
    export function drv8833SetPinsB(bin1: AnalogPin, bin2: AnalogPin): void {
        _drv8833BIN1 = bin1
        _drv8833BIN2 = bin2
    }

    //% block="DRV8833 motorA speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% group="듀얼 H-브리지 DC 모터(DRV8833)" weight=86
    export function drv8833MotorA(speed: number): void {
        let pwm = Math.abs(speed) * 10.23
        if (speed > 0) {
            pins.analogWritePin(_drv8833AIN1, pwm)
            pins.analogWritePin(_drv8833AIN2, 0)
        } else if (speed < 0) {
            pins.analogWritePin(_drv8833AIN1, 0)
            pins.analogWritePin(_drv8833AIN2, pwm)
        } else {
            pins.analogWritePin(_drv8833AIN1, 0)
            pins.analogWritePin(_drv8833AIN2, 0)
        }
    }

    //% block="DRV8833 motorB speed %speed"
    //% speed.min=-100 speed.max=100 speed.defl=0
    //% group="듀얼 H-브리지 DC 모터(DRV8833)" weight=85
    export function drv8833MotorB(speed: number): void {
        let pwm = Math.abs(speed) * 10.23
        if (speed > 0) {
            pins.analogWritePin(_drv8833BIN1, pwm)
            pins.analogWritePin(_drv8833BIN2, 0)
        } else if (speed < 0) {
            pins.analogWritePin(_drv8833BIN1, 0)
            pins.analogWritePin(_drv8833BIN2, pwm)
        } else {
            pins.analogWritePin(_drv8833BIN1, 0)
            pins.analogWritePin(_drv8833BIN2, 0)
        }
    }


    /********** 1채널 릴레이 **********/

    // 1채널 릴레이 핀
    let _relay1chPin: DigitalPin = DigitalPin.P0

    //% block="1channel relay pin set %pin"
    //% group="Relays" weight=70
    export function relay1chSetPin(pin: DigitalPin): void {
        _relay1chPin = pin
    }

    //% block="1channel relay %state"
    //% state.shadow="toggleOnOff"
    //% group="Relays" weight=69
    export function relay1ch(state: boolean): void {
        pins.digitalWritePin(_relay1chPin, state ? 1 : 0)
    }


    /********** 2채널 릴레이 **********/

    // 2채널 릴레이 핀
    let _relay2chPins: DigitalPin[] = [DigitalPin.P0, DigitalPin.P1]

    //% block="2channel relay pin set CH1 %pin1 CH2 %pin2"
    //% group="Relays" weight=68
    export function relay2chSetPins(pin1: DigitalPin, pin2: DigitalPin): void {
        _relay2chPins[0] = pin1
        _relay2chPins[1] = pin2
    }

    //% block="2channel relay channel %ch %state"
    //% ch.min=1 ch.max=2 ch.defl=1
    //% state.shadow="toggleOnOff"
    //% group="Relays" weight=67
    export function relay2ch(ch: number, state: boolean): void {
        pins.digitalWritePin(_relay2chPins[ch - 1], state ? 1 : 0)
    }


    /********** 4채널 릴레이 **********/

    // 4채널 릴레이 핀
    let _relay4chPins: DigitalPin[] = [DigitalPin.P0, DigitalPin.P1, DigitalPin.P2, DigitalPin.P3]

    //% block="4channel relay pin set CH1 %pin1 CH2 %pin2 CH3 %pin3 CH4 %pin4"
    //% group="Relays" weight=66
    //% inlineInputMode=inline
    export function relay4chSetPins(pin1: DigitalPin, pin2: DigitalPin, pin3: DigitalPin, pin4: DigitalPin): void {
        _relay4chPins[0] = pin1
        _relay4chPins[1] = pin2
        _relay4chPins[2] = pin3
        _relay4chPins[3] = pin4
    }

    //% block="4channel relay channel %ch %state"
    //% ch.min=1 ch.max=4 ch.defl=1
    //% state.shadow="toggleOnOff"
    //% group="Relays" weight=65
    export function relay4ch(ch: number, state: boolean): void {
        pins.digitalWritePin(_relay4chPins[ch - 1], state ? 1 : 0)
    }

    //% block="4channel relay all %state"
    //% state.shadow="toggleOnOff"
    //% group="Relays" weight=64
    export function relay4chAll(state: boolean): void {
        for (let i = 0; i < 4; i++) {
            pins.digitalWritePin(_relay4chPins[i], state ? 1 : 0)
        }
    }


    /********** 솔레노이드 **********/

    // 솔레노이드 핀
    let _solenoidPin: DigitalPin = DigitalPin.P0

    //% block="solenoid pin set %pin"
    //% group="Solenoid" weight=60
    export function solenoidSetPin(pin: DigitalPin): void {
        _solenoidPin = pin
    }

    //% block="solenoid %state"
    //% state.shadow="toggleOnOff"
    //% group="Solenoid" weight=59
    export function solenoid(state: boolean): void {
        pins.digitalWritePin(_solenoidPin, state ? 1 : 0)
    }


    /********** 팬 (쿨링팬) **********/

    // 팬 핀
    let _fanPin: AnalogPin = AnalogPin.P0

    //% block="fan pin set %pin"
    //% group="Fan모터" weight=58
    export function fanSetPin(pin: AnalogPin): void {
        _fanPin = pin
    }

    //% block="fan speed %speed \\%"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% group="Fan모터" weight=57
    export function fanSpeed(speed: number): void {
        let clampedSpeed = Math.constrain(speed, 0, 100)
        pins.analogWritePin(_fanPin, clampedSpeed * 10.23)
    }


    /********** 펌프 **********/

    // 펌프 핀
    let _pumpPin: DigitalPin = DigitalPin.P0

    //% block="pump pin set %pin"
    //% group="Pump모터" weight=56
    export function pumpSetPin(pin: DigitalPin): void {
        _pumpPin = pin
    }

    //% block="pump %state"
    //% state.shadow="toggleOnOff"
    //% group="Pump모터" weight=55
    export function pump(state: boolean): void {
        pins.digitalWritePin(_pumpPin, state ? 1 : 0)
    }
}
