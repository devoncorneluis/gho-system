"use client";
import { Polyline } from "@vis.gl/react-google-maps";

type Point = {  lat: number;  lng: number;};
type Props = {  path: Point[];};

export default function TripRoute({ path }: Props) {  if (path.length < 2) return null;  return (    <Polyline      path={path}      strokeColor="#2563eb"      strokeOpacity={0.9}      strokeWeight={5}    />  );}
