export interface Machine {
    identifier: string
    name: string
    description: string
    number: string
    type: string
    capacity: string
    created_on: string
}

export interface MachineTypes {
    ai: string
    name: string
    code: string
}