declare namespace SocketIOHub {
    export interface Vector3{
        x: number;
        y: number;
        z: number;
    }
    
    export interface Quaternion{
        x: number;
        y: number;
        z: number;
        w: number;        
    }
     
    export interface Transform{
        position?: Vector3;
        rotation?: Quaternion;
    }
    
    export interface ClientUpdate {
        socketid: string;
        transform?: Transform;
        deviceorientation?: Vector3;
    }
    
    export interface ClientInfo extends ClientUpdate{
        ipaddr?: string;
        useragent: string;
    }
}
