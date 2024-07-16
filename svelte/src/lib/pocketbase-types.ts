/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Cards = "Cards",
	CommPorts = "CommPorts",
	Sensors = "Sensors",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type CardsRecord = {
	rank: string
	suit: string
	uid: string
}

export enum CommPortsPositionOptions {
	"E1" = "1",
	"E2" = "2",
	"E3" = "3",
	"E4" = "4",
	"E5" = "5",
	"E6" = "6",
	"E7" = "7",
	"E8" = "8",
}
export type CommPortsRecord = {
	connected?: boolean
	port: number
	position?: CommPortsPositionOptions
	sensors?: RecordIdString[]
}

export enum SensorsPositionOptions {
	"E1" = "1",
	"E2" = "2",
	"E3" = "3",
	"E4" = "4",
	"E5" = "5",
	"E6" = "6",
	"E7" = "7",
	"E8" = "8",
	"r1" = "r1",
	"r2" = "r2",
	"r3" = "r3",
	"r4" = "r4",
	"r5" = "r5",
}
export type SensorsRecord = {
	cards?: RecordIdString[]
	commPort: RecordIdString
	position?: SensorsPositionOptions
}

export type UsersRecord = {
	avatar?: string
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type CardsResponse<Texpand = unknown> = Required<CardsRecord> & BaseSystemFields<Texpand>
export type CommPortsResponse<Texpand = unknown> = Required<CommPortsRecord> & BaseSystemFields<Texpand>
export type SensorsResponse<Texpand = unknown> = Required<SensorsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	Cards: CardsRecord
	CommPorts: CommPortsRecord
	Sensors: SensorsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	Cards: CardsResponse
	CommPorts: CommPortsResponse
	Sensors: SensorsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'Cards'): RecordService<CardsResponse>
	collection(idOrName: 'CommPorts'): RecordService<CommPortsResponse>
	collection(idOrName: 'Sensors'): RecordService<SensorsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
