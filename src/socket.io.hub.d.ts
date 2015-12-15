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
    
    export interface ClientInfo{
        ipaddr?: string;
        socketid?: string;
        useragent: string;
        transform?: Transform;
    }
}
